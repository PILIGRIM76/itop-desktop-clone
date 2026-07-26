// ========================================
// Supabase Client Tests
// ========================================

const { initSupabaseClient, getSupabaseClient, resetSupabaseClient } = require('../../supabase-client');

describe('Supabase Client', () => {
  beforeEach(() => {
    resetSupabaseClient();
  });

  test('should initialize client', () => {
    const client = initSupabaseClient();
    expect(client).toBeDefined();
  });

  test('should return same client instance (singleton)', () => {
    const client1 = getSupabaseClient();
    const client2 = getSupabaseClient();
    expect(client1).toBe(client2);
  });

  test('should reset client', () => {
    const client1 = getSupabaseClient();
    resetSupabaseClient();
    const client2 = getSupabaseClient();
    expect(client1).not.toBe(client2);
  });
});
