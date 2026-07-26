// ========================================
// Supabase Client Tests
// ========================================

// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    }))
  }))
}));

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

  test('should have auth methods', () => {
    const client = getSupabaseClient();
    expect(client.auth).toBeDefined();
    expect(typeof client.auth.getUser).toBe('function');
    expect(typeof client.auth.getSession).toBe('function');
    expect(typeof client.auth.signOut).toBe('function');
  });

  test('should have from method', () => {
    const client = getSupabaseClient();
    expect(typeof client.from).toBe('function');
  });
});
