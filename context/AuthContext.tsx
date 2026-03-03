
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
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

      if (error) throw error;

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

    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Supabase getSession error:', sessionError);
          throw sessionError;
        }

        if (session?.user && mounted) {
          const userData = await fetchUserData(session.user.id);
          if (mounted) setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userData = await fetchUserData(session.user.id);
          if (userData && mounted) {
            setCurrentUser(userData);
          }
        } catch (err) {
          console.error('Failed to update user session on event', err);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) setCurrentUser(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        try {
          const userData = await fetchUserData(session.user.id);
          if (userData && mounted) {
            setCurrentUser(userData);
          }
        } catch (err) {
          console.error('Failed to update user session on event', err);
        }
      }
    });

    // Configurando um verificador periódico da sessão (Refresh Token Heartbeat)
    const sessionHeartbeat = setInterval(async () => {
      try {
        if (!mounted) return;
        const { data: { session }, error } = await supabase.auth.getSession();

        // Verificamos o estado atual via setter funcional para evitar closure stale
        setCurrentUser(prevUser => {
          if (error || (!session && prevUser)) {
            console.warn('Sessão expirada silenciosamente ou erro de heartbeat:', error);
            return null;
          } else if (session && !prevUser) {
            console.log('Restaurando sessão a partir do heartbeat');
            // Como estamos num recálculo síncrono reativo, não podemos fazer await no prevUser. 
            // Ao invés disso, delegaremos para fora da closure:
          }
          return prevUser;
        });

        // Verificação assíncrona isolada do setter para não usar dados antigos da closure
        if (session) {
          const currentData = await fetchUserData(session.user.id);
          // Se o currentData for null (talvez erro de rede ou user apagado), DEIXAMOS QUETO
          // O hook onAuthStateChange cuidará se a sessão expirar de fato.
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
