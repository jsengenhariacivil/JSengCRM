import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { PayrollProvider } from './context/PayrollContext';
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
import Agenda from './pages/Agenda';
import CRM from './pages/CRM';
import Inventory from './pages/Inventory';
import Contracts from './pages/Contracts';
import Purchases from './pages/Purchases';
import Safety from './pages/Safety';
import Engineering from './pages/Engineering';
import Quality from './pages/Quality';
import Reports from './pages/Reports';
import Administration from './pages/Administration';
import PWAInstructions from './pages/PWAInstructions';
import Login from './pages/Login';
import UnderConstruction from './pages/UnderConstruction';
import PlanningPage from './pages/PlanningPage';
import DailyReportsPage from './pages/DailyReportsPage';
import MeasurementsPage from './pages/MeasurementsPage';
import Payroll from './pages/Payroll';
import { Status, UserPermissions } from './types';

// Componente para proteger rotas
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="w-10 h-10 border-4 border-[#c79229] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
      <PayrollProvider>
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

              <Route path="financeiro/contas" element={
                <RequirePermission permission="viewFinancial">
                  <FinancialAnalysis initialTab="payables" />
                </RequirePermission>
              } />

              <Route path="financeiro/fluxo" element={
                <RequirePermission permission="viewFinancial">
                  <FinancialAnalysis initialTab="cashflow" />
                </RequirePermission>
              } />

              <Route path="financeiro/dre" element={
                <RequirePermission permission="viewFinancial">
                  <FinancialAnalysis initialTab="dre" />
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

              <Route path="propostas" element={
                <RequirePermission permission="viewProposals">
                  <Proposals viewMode="list" />
                </RequirePermission>
              } />
              <Route path="propostas/nova" element={
                <RequirePermission permission="editProposals">
                  <Proposals viewMode="create" />
                </RequirePermission>
              } />
              <Route path="propostas/aprovadas" element={
                <RequirePermission permission="viewProposals">
                  <Proposals viewMode="list" filterStatus={Status.APPROVED} />
                </RequirePermission>
              } />

              <Route path="equipe/funcionarios" element={
                <RequirePermission permission="viewTeam">
                  <Team view="employees" />
                </RequirePermission>
              } />
              
              <Route path="folha" element={
                <RequirePermission permission="viewTeam">
                  <Payroll />
                </RequirePermission>
              } />
              <Route path="equipe/prestadores" element={
                <RequirePermission permission="viewTeam">
                  <Team view="contractors" />
                </RequirePermission>
              } />
              <Route path="equipe/pagamentos" element={
                <RequirePermission permission="viewTeam">
                  <Team view="payments" />
                </RequirePermission>
              } />
              <Route path="equipe/escalas" element={
                <RequirePermission permission="viewTeam">
                  <Team view="work_schedules" />
                </RequirePermission>
              } />

              <Route path="clientes" element={<Clients />} />
              <Route path="fornecedores" element={<Suppliers />} />
              <Route path="servicos" element={<ServicesPage />} />
              <Route path="agenda" element={
                <RequirePermission permission="viewProjects">
                  <Agenda />
                </RequirePermission>
              } />

              {/* CRM / Comercial */}
              <Route path="crm" element={<RequirePermission permission="viewProposals"><CRM /></RequirePermission>} />
              <Route path="comercial/contratos" element={<Contracts />} />

              {/* Compras, Estoque e OP */}
              <Route path="compras" element={<Purchases />} />
              <Route path="estoque" element={<RequirePermission permission="viewProjects"><Inventory /></RequirePermission>} />

              {/* Obras, Planejamento, Diário e Medição */}
              <Route path="obras" element={<RequirePermission permission="viewProjects"><Projects /></RequirePermission>} />
              <Route path="planejamento" element={<RequirePermission permission="viewProjects"><PlanningPage /></RequirePermission>} />
              <Route path="diario" element={<RequirePermission permission="viewProjects"><DailyReportsPage /></RequirePermission>} />
              <Route path="medicao" element={<RequirePermission permission="viewProjects"><MeasurementsPage /></RequirePermission>} />

              {/* Segurança, Qualidade e Engenharia */}
              <Route path="seguranca" element={<Safety />} />
              <Route path="engenharia" element={<Engineering />} />
              <Route path="qualidade" element={<Quality />} />

              {/* Extras */}
              <Route path="relatorios" element={<Reports />} />
              <Route path="administracao" element={<Administration />} />

              <Route path="instalar" element={<PWAInstructions />} />

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
      </PayrollProvider>
    </DataProvider>
  );
};

export default App;
