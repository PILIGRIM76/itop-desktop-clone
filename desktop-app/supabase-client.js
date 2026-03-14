// ========================================
// Supabase Client Module
// Клиент для подключения к Supabase
// ========================================

const { createClient } = require('@supabase/supabase-js');

// Конфигурация Supabase
// Настроено: 11 марта 2026 г.
const SUPABASE_URL = 'https://wwqhsmckvmfquezfsyds.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-ohfdIC9yMQMUzXJ54cKTg_GNDXnNgm';

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
