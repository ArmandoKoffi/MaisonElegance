import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, DbUser } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: DbUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  city?: string;
  pin: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from Supabase based on session
  const loadProfile = async (session: Session | null) => {
    if (!session?.user) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Erreur chargement profil:', error);
        setCurrentUser(null);
      } else {
        setCurrentUser(data);
      }
    } catch (err) {
      console.error(err);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper to pad PIN to 6 chars for Supabase (add "cb" at end: 1234 → 1234cb)
  const getSupabasePassword = (pin: string) => `${pin}cb`;

  const login = useCallback(async (identifier: string, pin: string) => {
    try {
      const email = identifier.includes('@') ? identifier : `${identifier.replace(/\+/g, '')}@chicbags.ci`;
      const password = identifier.includes('@') ? pin : getSupabasePassword(pin);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: identifier.includes('@') ? 'Identifiants incorrects.' : 'Identifiants incorrects (vérifiez votre numéro et code PIN).' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Une erreur est survenue.' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const email = `${data.phone.replace(/\+/g, '')}@chicbags.ci`;
      // 1. Create auth user with all metadata so the trigger can use it
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: getSupabasePassword(data.pin),
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            role: 'client'
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'Un compte existe déjà avec ce numéro de téléphone.' };
        }
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Update remaining fields (phone, address, city) — the trigger creates the row
        await supabase
          .from('users')
          .update({
            phone: data.phone,
            address: data.address || null,
            city: data.city || null,
          })
          .eq('id', authData.user.id);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: "Une erreur est survenue lors de l'inscription." };
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin: currentUser?.role === 'admin',
      isAuthenticated: !!currentUser,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
