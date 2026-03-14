// ========================================
// Supabase Test Configuration
// Тестовый файл для проверки подключения
// ========================================

// ВНИМАНИЕ: Замените эти значения на ваши из Supabase Dashboard!
const TEST_CONFIG = {
  SUPABASE_URL: 'https://your-project-id.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  
  // Тестовый пользователь
  TEST_EMAIL: 'test@example.com',
  TEST_PASSWORD: 'TestPassword123!',
  
  // Тестовый лицензионный ключ
  TEST_LICENSE_KEY: 'ITOP-PRO-ABCDE-12345-FGHIJ'
};

// Экспорт для использования в консоли
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TEST_CONFIG;
}

// Инструкция по использованию:
console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         Supabase Test Configuration Ready!                    ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Шаг 1: Настройте Supabase                                    ║
║  1. Перейдите на https://supabase.com                        ║
║  2. Создайте новый проект                                     ║
║  3. Скопируйте Project URL и anon key                         ║
║  4. Обновите этот файл с вашими ключами                       ║
║                                                               ║
║  Шаг 2: Создайте таблицы (SQL)                                ║
║  Откройте SQL Editor в Supabase и выполните                   ║
║  скрипт из QUICK_START_ACCOUNTS.md                            ║
║                                                               ║
║  Шаг 3: Протестируйте                                         ║
║  npm start                                                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
