// ========================================
// Supabase Client Module
// Клиент для подключения к Supabase
// ========================================

const { createClient } = require('@supabase/supabase-js');

// Конфигурация Supabase из переменных окружения
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Глобальный клиент Supabase
let supabaseClient = null;

// Инициализация клиента
function initSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: {
          getItem: (key) => {
            // В Electron используем localStorage из renderer
            return null; // Будет переопределено в account-manager
          },
          setItem: (key, value) => {
            // Будет переопределено в account-manager
          },
          removeItem: (key) => {
            // Будет переопределено в account-manager
          }
        }
      }
    });
  }
  return supabaseClient;
}

// Получить клиент (singleton)
function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = initSupabaseClient();
  }
  return supabaseClient;
}

// Сбросить клиент (для тестов)
function resetSupabaseClient() {
  supabaseClient = null;
}

// Экспорт функций
module.exports = {
  initSupabaseClient,
  getSupabaseClient,
  resetSupabaseClient,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
};
