import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }))
}))

describe('supabaseClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should export supabase client', async () => {
    const { supabase } = await import('../supabaseClient')
    expect(supabase).toBeDefined()
  })

  it('should export isAdmin function', async () => {
    const { isAdmin } = await import('../supabaseClient')
    expect(typeof isAdmin).toBe('function')
  })

  it('should export getCurrentUser function', async () => {
    const { getCurrentUser } = await import('../supabaseClient')
    expect(typeof getCurrentUser).toBe('function')
  })

  it('should export signOut function', async () => {
    const { signOut } = await import('../supabaseClient')
    expect(typeof signOut).toBe('function')
  })
})
