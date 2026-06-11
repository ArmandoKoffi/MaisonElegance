import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, DbUser } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: DbUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  password: string;
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

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: 'Identifiants incorrects.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Une erreur est survenue.' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: 'client' // Or Admin if you want to allow it, but usually restricted
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'Un compte existe déjà avec cet email.' };
        }
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Note: The handle_new_user trigger in Postgres will auto-create the public.users row
        // We just need to update the remaining fields (phone, address, city)
        const { error: updateError } = await supabase
          .from('users')
          .update({
            phone: data.phone,
            address: data.address,
            city: data.city
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Erreur mise à jour infos complémentaires:', updateError);
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Une erreur est survenue lors de l\'inscription.' };
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
