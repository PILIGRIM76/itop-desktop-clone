// ========================================
// iTop Easy Desktop - Email Worker
// Обработка очереди email уведомлений
// ========================================

// СНАЧАЛА загружаем .env!
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')
const nodemailer = require('nodemailer')

// Проверка переменных окружения
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not set in .env file!')
  console.error('Current values:')
  console.error('  SUPABASE_URL:', process.env.SUPABASE_URL || 'undefined')
  console.error('  SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '[SET]' : 'undefined')
  process.exit(1)
}

// Инициализация Supabase клиента
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Проверка подключения SMTP - ОТКЛЮЧЕНА для тестов
/*
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection failed:', error.message)
  } else {
    console.log('✅ SMTP connection ready')
  }
})
*/
console.log('📧 SMTP configured (verification disabled)')

// ========================================
// ОБРАБОТКА ОЧЕРЕДИ
// ========================================

async function processQueue() {
  console.log('📧 Processing email queue...')
  
  try {
    // Получаем pending уведомления
    const { data: notifications, error } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) {
      console.error('❌ Error fetching notifications:', error.message)
      return
    }

    if (!notifications || notifications.length === 0) {
      console.log('📭 No pending notifications')
      return
    }

    console.log(`📬 Found ${notifications.length} pending notifications`)

    // Обрабатываем каждое уведомление
    for (const notification of notifications) {
      await processNotification(notification)
    }

    console.log('✅ Queue processing completed')
  } catch (error) {
    console.error('❌ Error in processQueue:', error.message)
  }
}

// ========================================
// ОБРАБОТКА ОДНОГО УВЕДОМЛЕНИЯ
// ========================================

async function processNotification(notification) {
  console.log(`📤 Sending email to ${notification.recipient_email}...`)
  
  try {
    // Отправка email
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'iTop Easy Desktop'}" <${process.env.FROM_EMAIL}>`,
      to: notification.recipient_email,
      subject: notification.subject,
      html: notification.body,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'iTop Easy Desktop Email Worker'
      }
    })

    // Обновляем статус в базе
    await supabase
      .from('notification_queue')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
        last_error: null
      })
      .eq('id', notification.id)

    console.log(`✅ Email sent: ${info.messageId}`)
    
  } catch (error) {
    console.error(`❌ Failed to send to ${notification.recipient_email}:`, error.message)
    
    // Увеличиваем retry_count
    const newRetryCount = (notification.retry_count || 0) + 1
    
    if (newRetryCount >= 3) {
      // После 3 попыток помечаем как failed
      await supabase
        .from('notification_queue')
        .update({ 
          status: 'failed',
          retry_count: newRetryCount,
          last_error: error.message
        })
        .eq('id', notification.id)
      
      console.log(`🚫 Notification ${notification.id} marked as failed after 3 retries`)
    } else {
      // Возвращаем в очередь для повторной попытки
      await supabase
        .from('notification_queue')
        .update({ 
          retry_count: newRetryCount,
          last_error: error.message,
          scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString() // +5 минут
        })
        .eq('id', notification.id)
      
      console.log(`⏳ Will retry in 5 minutes (attempt ${newRetryCount}/3)`)
    }
  }
}

// ========================================
// СТАТИСТИКА
// ========================================

async function printStats() {
  try {
    const { data: stats } = await supabase
      .from('notification_queue')
      .select('status, count')
      .rpc('notification_stats') // Или обычный select с группировкой
    
    console.log('\n📊 Email Queue Statistics:')
    console.log('========================')
    
    const { data: queueStats } = await supabase
      .from('notification_queue')
      .select('status')
    
    const counts = queueStats?.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {}) || {}
    
    console.log(`  Pending: ${counts.pending || 0}`)
    console.log(`  Sent: ${counts.sent || 0}`)
    console.log(`  Failed: ${counts.failed || 0}`)
    console.log('========================\n')
    
  } catch (error) {
    console.error('❌ Error getting stats:', error.message)
  }
}

// ========================================
// ЗАПУСК
// ========================================

const INTERVAL_MS = parseInt(process.env.PROCESS_INTERVAL_MS) || 5 * 60 * 1000 // 5 минут

console.log('🚀 iTop Email Worker starting...')
console.log(`   Process interval: ${INTERVAL_MS / 1000 / 60} minutes`)
console.log(`   SMTP Host: ${process.env.SMTP_HOST}`)
console.log(`   From: ${process.env.FROM_EMAIL}`)
console.log('')

// Первый запуск сразу
processQueue()
printStats()

// Затем по расписанию
setInterval(() => {
  processQueue()
  printStats()
}, INTERVAL_MS)

// ========================================
// ОБРАБОТКА СИГНАЛОВ
// ========================================

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down email worker...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down email worker...')
  process.exit(0)
})
