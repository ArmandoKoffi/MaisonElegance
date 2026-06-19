import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, DbUser } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Fonction pour nettoyer un numéro de téléphone (supprime espaces, tirets, +, etc.)
const cleanPhone = (phone: string) => {
  return phone.replace(/[^0-9]/g, '');
};

// Fonction pour générer l'email à partir du numéro nettoyé
const generateEmailFromPhone = (cleanPhone: string) => {
  return `${cleanPhone}@chicbags.ci`;
};

interface AuthContextType {
  currentUser: DbUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<DbUser, 'address' | 'city' | 'phone'>>) => Promise<{ success: boolean; error?: string }>;
  checkPhoneUniqueness: (phone: string, excludeCurrentUserId?: string) => Promise<{ isAvailable: boolean; error?: string }>;
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
  const loadProfile = useCallback(async (session: Session | null) => {
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
  }, []);

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
  }, [loadProfile]);

  // Helper to pad PIN to 6 chars for Supabase (add "cb" at end: 1234 → 1234cb)
  const getSupabasePassword = (pin: string) => `${pin}cb`;

  const login = useCallback(async (phone: string, pin: string) => {
    try {
      const cleanedPhone = cleanPhone(phone);
      const email = generateEmailFromPhone(cleanedPhone);
      const password = getSupabasePassword(pin);
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: 'Identifiants incorrects (vérifiez votre numéro et code PIN).' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Une erreur est survenue.' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const cleanedPhone = cleanPhone(data.phone);
      const email = generateEmailFromPhone(cleanedPhone);
      
      // 1. Créer l'utilisateur auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: getSupabasePassword(data.pin),
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: cleanedPhone,
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
        // Mettre à jour la table users
        await supabase
          .from('users')
          .update({
            phone: cleanedPhone,
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

  const checkPhoneUniqueness = useCallback(async (phone: string, excludeCurrentUserId?: string) => {
    try {
      const cleanedPhone = cleanPhone(phone);
      
      let query = supabase.from('users').select('id').eq('phone', cleanedPhone);
      
      if (excludeCurrentUserId) {
        query = query.neq('id', excludeCurrentUserId);
      }
      
      const { data: existingUser, error: checkError } = await query.maybeSingle();
      
      if (checkError) throw checkError;
      
      return { isAvailable: !existingUser };
    } catch (err) {
      console.error('Erreur vérification numéro de téléphone:', err);
      return { isAvailable: false, error: 'Une erreur est survenue lors de la vérification.' };
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<Pick<DbUser, 'address' | 'city' | 'phone'>>) => {
    if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };
    
    try {
      const updates: Partial<Pick<DbUser, 'address' | 'city' | 'phone' | 'email'>> = {
        address: data.address !== undefined ? data.address : currentUser.address,
        city: data.city !== undefined ? data.city : currentUser.city,
      };

      // Si le téléphone est modifié
      if (data.phone !== undefined && data.phone !== currentUser.phone) {
        const cleanedPhone = cleanPhone(data.phone);
        
        // Vérifier l'unicité
        const { isAvailable, error: checkError } = await checkPhoneUniqueness(cleanedPhone, currentUser.id);
        
        if (checkError) {
          return { success: false, error: checkError };
        }
        if (!isAvailable) {
          return { success: false, error: 'Ce numéro de téléphone est déjà utilisé par un autre compte.' };
        }

        // Mettre à jour les champs pour la table users
        updates.phone = cleanedPhone;
        updates.email = generateEmailFromPhone(cleanedPhone);
      }

      // Mettre à jour la table users
      const { error: dbError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUser.id);
      
      if (dbError) throw dbError;
      
      // Mettre à jour l'état local
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    } catch (err) {
      console.error('Erreur mise à jour profil:', err);
      return { success: false, error: 'Une erreur est survenue lors de la mise à jour du profil.' };
    }
  }, [currentUser, checkPhoneUniqueness]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin: currentUser?.role === 'admin',
      isAuthenticated: !!currentUser,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      checkPhoneUniqueness,
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
