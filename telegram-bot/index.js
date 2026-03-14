// ========================================
// iTOP EASY DESKTOP - Telegram Bot
// ========================================

import TelegramBot from 'node-telegram-bot-api'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Конфигурация
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY
const ADMIN_CHAT_IDS = process.env.ADMIN_CHAT_IDS?.split(',').map(id => parseInt(id.trim())) || []

// Supabase клиент
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Проверка токена
if (!TELEGRAM_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set! Copy .env.example to .env and set your token.')
  process.exit(1)
}

// Создание бота
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

console.log('🤖 iTop Bot started...')

// ========================================
// HELPER FUNCTIONS
// ========================================

// Проверка администратора
async function isAdmin(chatId) {
  if (ADMIN_CHAT_IDS.includes(chatId)) return true
  
  // Проверка в базе (если chat_id привязан к пользователю)
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('telegram_chat_id', chatId)
    .single()
  
  return data && (data.role === 'admin' || data.role === 'superadmin')
}

// Форматирование статистики
function formatStats(stats) {
  return `
📊 **iTop System Statistics**

👥 Users:
   • Total: ${stats.total_users}
   • Pro: ${stats.pro_users} 🌟
   • Free: ${stats.free_users}

🎫 Licenses:
   • Total: ${stats.total_licenses}
   • Used: ${stats.used_licenses}
   • Available: ${stats.available_licenses}

📦 Private Boxes: ${stats.total_private_boxes}
💾 Snapshots: ${stats.total_snapshots}
`
}

// Генерация ключа
async function generateKey(type = 'pro', days = 365) {
  try {
    const { data, error } = await supabase.rpc('generate_license_key', {
      key_type: type,
      days
    })
    
    if (error) throw error
    
    return data
  } catch (error) {
    throw error
  }
}

// Поиск пользователя
async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', `%${email}%`)
    .limit(5)
  
  if (error) throw error
  return data
}

// Проверка лицензионного ключа
async function checkLicense(key) {
  const { data, error } = await supabase
    .from('license_keys')
    .select('*')
    .eq('key', key)
    .single()
  
  if (error) return null
  return data
}

// ========================================
// COMMANDS
// ========================================

// /start - Приветствие
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  
  const welcomeMessage = `
👋 Welcome to **iTop Easy Desktop Bot**!

🛡️ **Admin Commands:**
/stats - System statistics
/key <type> [count] - Generate license key
/user <email> - Find user
/check <key> - Check license key
/activate <key> - Activate license
/revoke <key> - Deactivate license

💡 **Examples:**
\`/key pro\` - Generate Pro key
\`/key trial 5\` - Generate 5 Trial keys
\`/user test@example.com\` - Find user
\`/check ITOP-PRO-ABCDE-12345-FGHIJ\`

📁 **User Commands:**
/activate <key> - Activate your license
/check <key> - Check key status

_Only administrators can use admin commands._
`
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' })
})

// /help - Справка
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Send /start to see available commands')
})

// /stats - Статистика (Admin only)
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id
  
  if (!await isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Access denied: Admin privileges required')
    return
  }
  
  try {
    const { data } = await supabase
      .from('admin_stats_overview')
      .select('*')
      .single()
    
    if (!data) {
      bot.sendMessage(chatId, '❌ No statistics available')
      return
    }
    
    bot.sendMessage(chatId, formatStats(data), { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Stats error:', error)
    bot.sendMessage(chatId, '❌ Error: ' + error.message)
  }
})

// /key <type> [count] - Генерация ключа (Admin only)
bot.onText(/\/key (\w+)(?:\s+(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id
  const type = match[1].toLowerCase()
  const count = parseInt(match[2]) || 1
  
  if (!await isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Access denied: Admin privileges required')
    return
  }
  
  // Валидация типа
  const validTypes = ['pro', 'trial', 'enterprise']
  if (!validTypes.includes(type)) {
    bot.sendMessage(chatId, `❌ Invalid type. Valid types: ${validTypes.join(', ')}`)
    return
  }
  
  // Ограничение количества
  if (count > 10) {
    bot.sendMessage(chatId, '❌ Maximum 10 keys per request')
    return
  }
  
  try {
    const days = type === 'trial' ? 14 : type === 'enterprise' ? 730 : 365
    const keys = []
    
    for (let i = 0; i < count; i++) {
      const key = await generateKey(type, days)
      keys.push(key)
    }
    
    // Логирование
    await supabase.rpc('log_admin_action', {
      p_action: 'TELEGRAM_KEY_GENERATED',
      p_target_type: 'license_keys',
      p_details: { count, type, chat_id: chatId }
    })
    
    const message = `
✅ **Generated ${keys.length} license key(s)**

Type: **${type.toUpperCase()}**
Duration: **${days} days**

${keys.map((k, i) => `${i + 1}. \` ${k} \``).join('\n')}

_Use /check <key> to verify_
`
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Key generation error:', error)
    bot.sendMessage(chatId, '❌ Error: ' + error.message)
  }
})

// /user <email> - Поиск пользователя (Admin only)
bot.onText(/\/user (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const email = match[1]
  
  if (!await isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Access denied: Admin privileges required')
    return
  }
  
  try {
    const users = await findUserByEmail(email)
    
    if (!users || users.length === 0) {
      bot.sendMessage(chatId, '❌ No users found')
      return
    }
    
    const message = users.map(u => `
👤 **${u.full_name || 'No name'}**
   • Email: \`${u.email}\`
   • Role: ${u.role}
   • Type: ${u.account_type}
   • Created: ${new Date(u.created_at).toLocaleDateString()}
`).join('\n')
    
    bot.sendMessage(chatId, `Found ${users.length} user(s):\n\n${message}`, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('User search error:', error)
    bot.sendMessage(chatId, '❌ Error: ' + error.message)
  }
})

// /check <key> - Проверка ключа
bot.onText(/\/check (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const key = match[1].trim()
  
  try {
    const license = await checkLicense(key)
    
    if (!license) {
      bot.sendMessage(chatId, '❌ Invalid license key')
      return
    }
    
    const status = license.is_used ? '✅ Used' : '🟢 Available'
    const usedBy = license.used_by ? `\`${license.used_by.substring(0, 8)}...\`` : 'N/A'
    
    const message = `
🎫 **License Key Info**

Key: \`${license.key}\`
Type: **${license.type.toUpperCase()}**
Duration: ${license.duration_days} days
Status: ${status}
Used By: ${usedBy}
Created: ${new Date(license.created_at).toLocaleDateString()}
${license.activated_at ? `Activated: ${new Date(license.activated_at).toLocaleDateString()}` : ''}
`
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Check key error:', error)
    bot.sendMessage(chatId, '❌ Error: ' + error.message)
  }
})

// /activate <key> - Активация ключа
bot.onText(/\/activate (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const key = match[1].trim()
  
  try {
    const license = await checkLicense(key)
    
    if (!license) {
      bot.sendMessage(chatId, '❌ Invalid license key')
      return
    }
    
    if (license.is_used) {
      bot.sendMessage(chatId, '❌ This key is already activated')
      return
    }
    
    // Получаем пользователя по chat_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single()
    
    if (!profile) {
      bot.sendMessage(chatId, '❌ Telegram account not linked. Please contact support.')
      return
    }
    
    // Активация
    const { error } = await supabase
      .from('license_keys')
      .update({
        is_used: true,
        used_by: profile.id,
        activated_at: new Date().toISOString()
      })
      .eq('key', key)
    
    if (error) throw error
    
    // Обновление профиля
    await supabase
      .from('profiles')
      .update({
        account_type: 'pro',
        license_key: key,
        license_expires_at: new Date(Date.now() + license.duration_days * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', profile.id)
    
    bot.sendMessage(chatId, `✅ **License activated!**\n\nPro access for ${license.duration_days} days`, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Activate key error:', error)
    bot.sendMessage(chatId, '❌ Error: ' + error.message)
  }
})

// /revoke <key> - Отозвать ключ (Superadmin only)
bot.onText(/\/revoke (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const key = match[1].trim()
  
  if (!await isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Access denied: Admin privileges required')
    return
  }
  
  try {
    const license = await checkLicense(key)
    
    if (!license) {
      bot.sendMessage(chatId, '❌ Invalid license key')
      return
    }
    
    if (!license.is_used) {
      bot.sendMessage(chatId, '❌ Key is not activated')
      return
    }
    
    const { error } = await supabase
      .from('license_keys')
      .update({
        is_used: false,
        used_by: null,
        activated_at: null
      })
      .eq('key', key)
    
    if (error) throw error
    
    await supabase.rpc('log_admin_action', {
      p_action: 'TELEGRAM_KEY_REVOKED',
      p_target_type: 'license_keys',
      p_target_id: license.id,
      p_details: { chat_id: chatId }
    })
    
    bot.sendMessage(chatId, `✅ **Key revoked**\n\n\`${key}\``, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Revoke key error:', error)
    bot.sendMessage(chatId, '❌ Error: ' + error.message)
  }
})

// ========================================
// ERROR HANDLING
// ========================================

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message)
})

bot.on('error', (error) => {
  console.error('Bot error:', error)
})

console.log('✅ iTop Bot is running...')
