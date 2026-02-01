
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  HardHat, 
  Users, 
  FileText, 
  Menu, 
  X, 
  Settings,
  ChevronDown,
  ChevronRight,
  Truck,
  Package,
  Folder,
  PlusCircle,
  CheckCircle,
  Send,
  Briefcase,
  User,
  UserCog,
  Calendar,
  Banknote,
  PieChart,
  LogOut
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label, onClick, isSubItem = false }: { to: string, icon: any, label: string, onClick?: () => void, isSubItem?: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to) && to !== '/propostas' && to !== '/equipe'); 
  
  const activeStyle = isActive 
    ? 'bg-[#c79229] text-[#181418] font-bold shadow-md' 
    : 'text-slate-400 hover:text-[#c79229] hover:bg-[#181418]/50';

  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      end={to === '/'} 
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeStyle} ${isSubItem ? 'pl-11 py-2 text-sm' : ''}`}
    >
      <Icon size={isSubItem ? 18 : 20} />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

const Layout: React.FC = () => {
  const { companyName, companyLogo } = useData();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);
  const [isPropostasOpen, setIsPropostasOpen] = useState(false);
  const [isEquipeOpen, setIsEquipeOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleCadastros = () => setIsCadastrosOpen(!isCadastrosOpen);
  const togglePropostas = () => setIsPropostasOpen(!isPropostasOpen);
  const toggleEquipe = () => setIsEquipeOpen(!isEquipeOpen);

  // Logout Handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Auto-expand menus based on current route
  useEffect(() => {
    const path = location.pathname;
    if (['/clientes', '/fornecedores', '/servicos'].some(p => path.startsWith(p))) {
      setIsCadastrosOpen(true);
    }
    if (path.startsWith('/propostas')) {
      setIsPropostasOpen(true);
    }
    if (path.startsWith('/equipe')) {
      setIsEquipeOpen(true);
    }
  }, [location.pathname]);

  // Permissions Check Helpers
  const canViewFinancial = currentUser?.permissions.viewFinancial;
  const canViewProjects = currentUser?.permissions.viewProjects;
  const canManageSettings = currentUser?.permissions.manageSettings;

  const NavContent = ({ mobile = false }) => (
    <>
      <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={mobile ? toggleMenu : undefined} />
      
      {canViewFinancial && (
        <>
          <SidebarItem to="/financeiro" icon={Wallet} label="Financeiro" onClick={mobile ? toggleMenu : undefined} />
          <SidebarItem to="/analise" icon={PieChart} label="Análise Financeira" onClick={mobile ? toggleMenu : undefined} />
        </>
      )}

      {canViewProjects && (
        <SidebarItem to="/obras" icon={HardHat} label="Obras" onClick={mobile ? toggleMenu : undefined} />
      )}
      
      {/* Propostas (Assumindo que todos exceto Visitante podem ver) */}
      {(canViewFinancial || canViewProjects) && (
        <div className="space-y-1">
          <button 
            onClick={togglePropostas}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-slate-400 hover:text-[#c79229] hover:bg-[#181418]/50`}
          >
            <div className="flex items-center space-x-3">
              <FileText size={20} />
              <span className="font-medium">Propostas</span>
            </div>
            {isPropostasOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isPropostasOpen && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <SidebarItem to="/propostas/nova" icon={PlusCircle} label="Nova Proposta" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/propostas" icon={Send} label="Propostas Enviadas" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/propostas/aprovadas" icon={CheckCircle} label="Propostas Aprovadas" isSubItem onClick={mobile ? toggleMenu : undefined} />
            </div>
          )}
        </div>
      )}

      {/* Equipe (RH ou Financeiro ou Admin) */}
      {(canViewFinancial || canManageSettings) && (
        <div className="space-y-1">
          <button 
            onClick={toggleEquipe}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-slate-400 hover:text-[#c79229] hover:bg-[#181418]/50`}
          >
            <div className="flex items-center space-x-3">
              <Briefcase size={20} />
              <span className="font-medium">Equipe</span>
            </div>
            {isEquipeOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isEquipeOpen && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <SidebarItem to="/equipe/funcionarios" icon={User} label="Funcionários" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/equipe/prestadores" icon={UserCog} label="Prestadores" isSubItem onClick={mobile ? toggleMenu : undefined} />
              {canViewFinancial && (
                  <SidebarItem to="/equipe/pagamentos" icon={Banknote} label="Pagamentos" isSubItem onClick={mobile ? toggleMenu : undefined} />
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Cadastros (Geralmente operacional/financeiro) */}
      {(canViewFinancial || canViewProjects) && (
        <div className="space-y-1">
          <button 
            onClick={toggleCadastros}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-slate-400 hover:text-[#c79229] hover:bg-[#181418]/50`}
          >
            <div className="flex items-center space-x-3">
              <Folder size={20} />
              <span className="font-medium">Cadastros</span>
            </div>
            {isCadastrosOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isCadastrosOpen && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <SidebarItem to="/clientes" icon={Users} label="Clientes" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/fornecedores" icon={Truck} label="Fornecedores" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/servicos" icon={Package} label="Serviços" isSubItem onClick={mobile ? toggleMenu : undefined} />
            </div>
          )}
        </div>
      )}

      {/* Configurações apenas para quem tem permissão */}
      {canManageSettings && (
        <div className="pt-6 mt-6 border-t border-[#c79229]/20">
             <SidebarItem to="/configuracoes" icon={Settings} label="Configurações" onClick={mobile ? toggleMenu : undefined} />
        </div>
      )}

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-red-400 hover:text-red-500 hover:bg-red-900/10 mt-2"
      >
        <LogOut size={20} />
        <span className="font-medium">Sair</span>
      </button>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#181418] text-white flex-shrink-0 border-r border-[#c79229]/20">
        <div className="p-6 border-b border-[#c79229]/20 flex flex-col items-center space-y-4 text-center justify-center min-h-[140px]">
          <div className="w-full flex justify-center">
            {companyLogo ? (
               <img 
                 src={companyLogo} 
                 alt={companyName} 
                 className="max-h-24 max-w-full object-contain mx-auto" 
               />
            ) : (
               <div>
                  <h1 className="text-xl font-bold tracking-tight text-white leading-tight">{companyName}</h1>
                  <p className="text-[10px] text-[#c79229] uppercase tracking-widest mt-1">Construção & Reforma</p>
               </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <NavContent />
        </nav>

        <div className="p-4 border-t border-[#c79229]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#c79229] flex items-center justify-center text-[#181418] font-bold">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-[#c79229] truncate">{currentUser?.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#181418]/50 md:hidden" onClick={toggleMenu}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#181418] text-white p-4 shadow-xl border-r border-[#c79229]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
               <div className="flex flex-col items-start space-y-2 w-full">
                 {companyLogo ? (
                    <img src={companyLogo} alt="Logo" className="max-h-16 w-auto object-contain" />
                 ) : (
                    <span className="text-lg font-bold">{companyName}</span>
                 )}
              </div>
              <button onClick={toggleMenu}><X className="text-[#c79229]" /></button>
            </div>
            <nav className="space-y-2">
              <NavContent mobile={true} />
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Mobile */}
        <header className="md:hidden bg-[#181418] shadow-md h-16 flex items-center justify-between px-4 z-10 border-b border-[#c79229]">
          <div className="flex items-center space-x-2">
             {companyLogo ? (
                <img src={companyLogo} alt="Logo" className="h-10 w-auto object-contain" />
             ) : (
                <span className="font-bold text-white text-lg">{companyName}</span>
             )}
          </div>
          <button onClick={toggleMenu} className="p-2 text-[#c79229] hover:bg-white/10 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
