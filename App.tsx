
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import FinancialAnalysis from './pages/FinancialAnalysis';
import Projects from './pages/Projects';
import Proposals from './pages/Proposals';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import Suppliers from './pages/Suppliers';
import ServicesPage from './pages/ServicesPage';
import Team from './pages/Team';
import Login from './pages/Login';
import { Status, UserPermissions } from './types';

// Componente para proteger rotas
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Componente para verificar permissões específicas
const RequirePermission = ({ permission, children }: { permission: keyof UserPermissions, children: React.ReactNode }) => {
   const { currentUser } = useAuth();
   
   if (!currentUser?.permissions[permission]) {
      return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Acesso Restrito</h2>
                <p className="text-slate-500">Seu perfil de usuário ({currentUser?.role}) não tem permissão para acessar esta página.</p>
                {currentUser?.role === 'Visitante' && (
                    <p className="text-sm text-[#c79229] mt-4 font-bold">Aguarde a aprovação do administrador.</p>
                )}
            </div>
          </div>
      );
   }

   return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Rota Pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas Protegidas */}
            <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              
              <Route path="financeiro" element={
                <RequirePermission permission="viewFinancial">
                  <Finance />
                </RequirePermission>
              } />
              
              <Route path="analise" element={
                 <RequirePermission permission="viewFinancial">
                    <FinancialAnalysis />
                 </RequirePermission>
              } />

              <Route path="obras" element={
                 <RequirePermission permission="viewProjects">
                    <Projects />
                 </RequirePermission>
              } />
              
              <Route path="propostas" element={<Proposals viewMode="list" />} />
              <Route path="propostas/nova" element={<Proposals viewMode="create" />} />
              <Route path="propostas/aprovadas" element={<Proposals viewMode="list" filterStatus={Status.APPROVED} />} />
              
              <Route path="equipe/funcionarios" element={<Team view="employees" />} />
              <Route path="equipe/prestadores" element={<Team view="contractors" />} />
              <Route path="equipe/pagamentos" element={<Team view="payments" />} />

              <Route path="clientes" element={<Clients />} />
              <Route path="fornecedores" element={<Suppliers />} />
              <Route path="servicos" element={<ServicesPage />} />
              
              {/* Configurações restrito apenas para quem tem permissão */}
              <Route path="configuracoes" element={
                 <RequirePermission permission="manageSettings">
                    <Settings />
                 </RequirePermission>
              } />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </DataProvider>
  );
};

export default App;
