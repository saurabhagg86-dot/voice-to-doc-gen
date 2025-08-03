import { createClient } from '@supabase/supabase-js'

// For demo purposes, we'll create a mock client
// In a real application, you would use actual Supabase credentials
const supabaseUrl = 'https://demo.supabase.co'
const supabaseAnonKey = 'demo-key'

// Create a mock Supabase client for demo purposes
const createMockSupabaseClient = () => {
  const mockUsers = new Map();
  let currentUser: any = null;
  let sessionChangeCallback: ((event: string, session: any) => void) | null = null;

  return {
    auth: {
      signUp: async ({ email, password }: { email: string; password: string }) => {
        if (mockUsers.has(email)) {
          return { error: new Error('User already exists') };
        }
        mockUsers.set(email, { email, password });
        return { error: null };
      },
      
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const user = mockUsers.get(email);
        if (!user || user.password !== password) {
          return { error: new Error('Invalid credentials') };
        }
        currentUser = { email, id: Math.random().toString() };
        const session = { user: currentUser };
        if (sessionChangeCallback) {
          sessionChangeCallback('SIGNED_IN', session);
        }
        return { error: null };
      },
      
      signOut: async () => {
        currentUser = null;
        if (sessionChangeCallback) {
          sessionChangeCallback('SIGNED_OUT', null);
        }
        return { error: null };
      },
      
      getSession: async () => {
        return { data: { session: currentUser ? { user: currentUser } : null } };
      },
      
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        sessionChangeCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                sessionChangeCallback = null;
              }
            }
          }
        };
      }
    }
  };
};

export const supabase = createMockSupabaseClient();