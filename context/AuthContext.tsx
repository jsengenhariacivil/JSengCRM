
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserData, UserPermissions } from '../types';

interface AuthContextType {
  currentUser: UserData | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar dados do usuário do banco
  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    try {
      const timeoutPromise = new Promise<{ data: null, error: Error }>((resolve) => setTimeout(() => resolve({ data: null, error: new Error('fetchUserData Timeout') }), 8000));
      const fetchRequest = supabase.from('users').select('*').eq('id', userId).single();
      const { data, error } = await Promise.race([fetchRequest, timeoutPromise]) as any;

      if (error) {
        console.warn('Supabase fetch errored or timed out for user', userId, error.message);
        // We do not throw, we just return null so the app doesn't crash/hang
        return null;
      }

      if (data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          permissions: {
            viewFinancial: data.view_financial,
            editFinancial: data.edit_financial,
            viewProjects: data.view_projects,
            editProjects: data.edit_projects,
            viewProposals: data.view_proposals ?? ['Administrador', 'Gerente', 'Comercial', 'Engenharia'].includes(data.role),
            editProposals: data.edit_proposals ?? ['Administrador', 'Gerente', 'Comercial'].includes(data.role),
            viewTeam: data.view_team ?? ['Administrador', 'Gerente', 'Financeiro', 'RH'].includes(data.role),
            manageSettings: data.manage_settings,
          },
        };
      }

      console.warn('fetchUserData found no user for ID:', userId);
      return null;
    } catch (error: any) {
      console.error('Error fetching user data:', error.message || error);
      return null;
    }
  };

  // Verifica sessão ao iniciar
  useEffect(() => {
    let mounted = true;

    // 1. Busca inicial super rápida (lê do sessionStorage)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && mounted) {
        try {
          const userData = await fetchUserData(session.user.id);
          if (mounted && userData) {
            setCurrentUser(userData);
          }
        } catch (err) {
          console.error("Erro ao carregar dados do usuário no getSession", err);
        }
      }
      if (mounted) setLoading(false);
    });

    // 2. Escuta mudanças (incluindo o evento INITIAL_SESSION disparado logo de cara)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'INITIAL_SESSION') {
        // Já tratado pelo getSession acima (ou aqui).
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user && mounted) {
          try {
            const userData = await fetchUserData(session.user.id);
            if (mounted && userData) {
              setCurrentUser(userData);
            }
          } catch (err) {
            console.error('Falha ao atualizar sessão do usuário no evento', err);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) setCurrentUser(null);
      }
    });

    // Configurando um verificador periódico da sessão (Refresh Token Heartbeat)
    const sessionHeartbeat = setInterval(async () => {
      try {
        if (!mounted) return;
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          setCurrentUser(null);
        } else if (session && mounted) {
          const currentData = await fetchUserData(session.user.id);
          if (currentData && mounted) {
            setCurrentUser(currentData);
          }
        }
      } catch (err) {
        console.error('Falha no heartbeat de sessão', err);
      }
    }, 5 * 60 * 1000); // Checa a cada 5 minutos

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(sessionHeartbeat);
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await supabase.auth.signInWithPassword({ email, password });
      const data = result.data;
      const error = result.error;

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const userData = await fetchUserData(data.user.id);
        if (userData) {
          setCurrentUser(userData);
          return { success: true };
        } else {
          return { success: false, error: 'Usuário não encontrado no banco de dados' };
        }
      }

      return { success: false, error: 'Erro desconhecido' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      isAuthenticated: !!currentUser,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
