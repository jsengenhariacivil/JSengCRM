
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
  Briefcase,
  User,
  UserCog,
  Calendar,
  Banknote,
  LogOut,
  Bell,
  Smartphone,
  ShoppingCart,
  ShieldCheck,
  CheckSquare,
  BarChart3,
  Shield,
  ClipboardList,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

// --- COMPONENTS OUTSIDE TO PREVENT RE-RENDERS ---

const SidebarItem = ({ to, icon: Icon, label, onClick, isSubItem = false }: { to: string, icon: any, label: string, onClick?: () => void, isSubItem?: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to) && !['/propostas', '/crm', '/obras', '/equipe'].some(p => to.startsWith(p)));

  const activeStyle = isActive
    ? 'bg-[#c79229] text-[#181418] font-bold shadow-md'
    : 'text-slate-400 hover:text-[#c79229] hover:bg-[#181418]/50';

  return (
    <NavLink
      to={to}
      onClick={onClick}
      end={to === '/'}
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${activeStyle} ${isSubItem ? 'pl-11 py-1.5 text-sm' : ''} whitespace-nowrap`}
    >
      <Icon size={isSubItem ? 18 : 20} />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

const NotificationBell = ({ isDarkBg = false }: { isDarkBg?: boolean }) => {
  const { notifications, markNotificationAsRead } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 transition-colors rounded-full flex items-center justify-center ${isDarkBg
          ? 'text-slate-300 hover:text-[#c79229] hover:bg-white/5'
          : 'text-slate-500 hover:text-[#c79229] hover:bg-slate-200/50 bg-white shadow-sm border border-slate-200'
          }`}
      >
        <Bell size={isDarkBg ? 24 : 20} />
        {unreadCount > 0 && (
          <span className={`absolute ${isDarkBg ? 'top-0 right-0' : '-top-1 -right-1'} w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 ${isDarkBg ? 'border-[#181418]' : 'border-white'}`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#181418] text-[#c79229] px-4 py-3 font-semibold flex justify-between items-center">
            <span>Notificações</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-[#c79229]/20 px-2 py-1 rounded-full text-white">{unreadCount} novas</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">Pronto, você está atualizado!</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-slate-100 transition-colors ${!n.is_read ? 'bg-amber-50/30 hover:bg-amber-50/80 cursor-pointer' : 'opacity-70 hover:bg-slate-50'}`}
                  onClick={() => {
                    if (!n.is_read) markNotificationAsRead(n.id);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <h4 className={`text-sm tracking-tight ${!n.is_read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                      {n.title}
                    </h4>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5 ml-3"></div>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                    {new Date(n.created_at).toLocaleDateString('pt-BR')} às {new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const NavContent = ({
  mobile = false,
  toggleMenu,
  canViewProposals,
  canViewProjects,
  canViewFinancial,
  canViewTeam,
  canManageSettings,
  openGroup, toggleGroup,
  isCRMActive,
  isRHActive,
  handleLogout
}: any) => {
  const isCRMOpen = openGroup === 'crm';
  const isRHOpen = openGroup === 'rh';
  const isFinanceOpen = openGroup === 'finance';
  const isObrasOpen = openGroup === 'obras';
  const isSuprimentosOpen = openGroup === 'suprimentos';

  return (
    <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto custom-scrollbar">
      {/* Dashboard */}
      <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={mobile ? toggleMenu : undefined} />

      {/* Gestão CRM */}
      <div className="space-y-1">
        <button
          onClick={() => toggleGroup('crm')}
          className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${isCRMActive ? 'bg-[#c79229] text-[#181418] font-bold shadow-md' : 'text-slate-400 hover:text-[#c79229] hover:bg-[#181418]/50'} whitespace-nowrap`}
        >
          <div className="flex items-center space-x-3">
            <Briefcase size={20} />
            <span className="font-medium">CRM</span>
          </div>
          {isCRMOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {isCRMOpen && (
          <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
            <SidebarItem to="/crm" icon={LayoutDashboard} label="Funil de Vendas" isSubItem onClick={mobile ? toggleMenu : undefined} />
            <SidebarItem to="/propostas" icon={FileText} label="Propostas" isSubItem onClick={mobile ? toggleMenu : undefined} />
            <SidebarItem to="/comercial/contratos" icon={PlusCircle} label="Contratos" isSubItem onClick={mobile ? toggleMenu : undefined} />
            <SidebarItem to="/clientes" icon={User} label="Clientes" isSubItem onClick={mobile ? toggleMenu : undefined} />
          </div>
        )}
      </div>

      {/* RH */}
      {canViewTeam && (
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup('rh')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${isRHActive ? 'bg-[#c79229] text-[#181418] font-bold shadow-md' : 'text-slate-400 hover:text-[#c79229] hover:bg-[#181418]/50'} whitespace-nowrap`}
          >
            <div className="flex items-center space-x-3">
              <Users size={20} />
              <span className="font-medium">RH</span>
            </div>
            {isRHOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isRHOpen && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <SidebarItem to="/equipe/funcionarios" icon={UserCog} label="Funcionários" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/equipe/prestadores" icon={Users} label="Prestadores" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/equipe/pagamentos" icon={Banknote} label="Pagamentos" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/equipe/escalas" icon={Calendar} label="Escalas de Trabalho" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/folha" icon={ClipboardList} label="Folha de Pagamento" isSubItem onClick={mobile ? toggleMenu : undefined} />
            </div>
          )}
        </div>
      )}

      {/* Gestão Financeira */}
      {canViewFinancial && (
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup('finance')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${location.pathname.startsWith('/financeiro') ? 'bg-[#c79229] text-[#181418] font-bold shadow-md' : 'text-slate-400 hover:text-[#c79229] hover:bg-[#181418]/50'} whitespace-nowrap`}
          >
            <div className="flex items-center space-x-3">
              <Wallet size={20} />
              <span className="font-medium">Gestão Financeira</span>
            </div>
            {isFinanceOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isFinanceOpen && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <SidebarItem to="/financeiro" icon={Wallet} label="Lançamentos" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/financeiro/contas" icon={AlertCircle} label="Contas a Pagar/Rec" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/financeiro/fluxo" icon={TrendingUp} label="Fluxo de Caixa" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/financeiro/dre" icon={BarChart3} label="Análise DRE" isSubItem onClick={mobile ? toggleMenu : undefined} />
            </div>
          )}
        </div>
      )}

      {/* Gestão de Obras */}
      {canViewProjects && (
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup('obras')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${['/obras', '/planejamento', '/diario', '/medicao'].some(p => location.pathname.startsWith(p)) ? 'bg-[#c79229] text-[#181418] font-bold shadow-md' : 'text-slate-400 hover:text-[#c79229] hover:bg-[#181418]/50'} whitespace-nowrap`}
          >
            <div className="flex items-center space-x-3">
              <HardHat size={20} />
              <span className="font-medium">Gestão de Obras</span>
            </div>
            {isObrasOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isObrasOpen && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <SidebarItem to="/obras" icon={Folder} label="Obras / Projetos" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/planejamento" icon={Calendar} label="Planejamento" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/diario" icon={FileText} label="RDO" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/medicao" icon={CheckSquare} label="Medição" isSubItem onClick={mobile ? toggleMenu : undefined} />
            </div>
          )}
        </div>
      )}

      {/* Suprimentos */}
      {canViewProjects && (
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup('suprimentos')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${['/compras', '/estoque', '/fornecedores', '/servicos'].some(p => location.pathname.startsWith(p)) ? 'bg-[#c79229] text-[#181418] font-bold shadow-md' : 'text-slate-400 hover:text-[#c79229] hover:bg-[#181418]/50'} whitespace-nowrap`}
          >
            <div className="flex items-center space-x-3">
              <ShoppingCart size={20} />
              <span className="font-medium">Suprimentos</span>
            </div>
            {isSuprimentosOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isSuprimentosOpen && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <SidebarItem to="/compras" icon={ShoppingCart} label="Compras" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/estoque" icon={Package} label="Estoque" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/fornecedores" icon={Truck} label="Fornecedores" isSubItem onClick={mobile ? toggleMenu : undefined} />
              <SidebarItem to="/servicos" icon={ClipboardList} label="Serviços" isSubItem onClick={mobile ? toggleMenu : undefined} />
            </div>
          )}
        </div>
      )}

      {/* Agenda */}
      {canViewProjects && (
        <SidebarItem to="/agenda" icon={Calendar} label="Agenda" onClick={mobile ? toggleMenu : undefined} />
      )}

      {/* SST */}
      <SidebarItem to="/seguranca" icon={ShieldCheck} label="SST" onClick={mobile ? toggleMenu : undefined} />

      {/* Qualidade */}
      <SidebarItem to="/qualidade" icon={CheckSquare} label="Qualidade" onClick={mobile ? toggleMenu : undefined} />

      {/* Documentos (Engenharia) */}
      <SidebarItem to="/engenharia" icon={Folder} label="Documentos" onClick={mobile ? toggleMenu : undefined} />

      {/* Relatórios */}
      <SidebarItem to="/relatorios" icon={BarChart3} label="Relatórios" onClick={mobile ? toggleMenu : undefined} />

      {/* App Celular */}
      <SidebarItem to="/instalar" icon={Smartphone} label="App no Celular" onClick={mobile ? toggleMenu : undefined} />

      {/* Administração */}
      <SidebarItem to="/administracao" icon={Shield} label="Administração" onClick={mobile ? toggleMenu : undefined} />

      {/* Configurações */}
      {canManageSettings && (
        <div className="pt-6 mt-6 border-t border-[#c79229]/20">
          <SidebarItem to="/configuracoes" icon={Settings} label="Configurações" onClick={mobile ? toggleMenu : undefined} />
        </div>
      )}

      {/* Logout Button */}
      <div className="pt-4 mt-4 border-t border-[#c79229]/10">
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-red-400 hover:text-red-500 hover:bg-red-900/10"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Limpar cache e recarregar? (Isso resolverá problemas de versão antiga)')) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-slate-500 hover:text-slate-300 text-[10px] uppercase tracking-widest"
          >
            <Smartphone size={14} />
            <span>Limpar Cache (v2.0.6)</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const Layout: React.FC = () => {
  const { companyName, companyLogo } = useData();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleGroup = (group: string) => {
    setOpenGroup(openGroup === group ? null : group);
  };

  const isCRMActive = ['/crm', '/propostas', '/comercial', '/clientes'].some(p => location.pathname.startsWith(p));
  const isCadastroActive = ['/clientes', '/fornecedores', '/servicos'].some(p => location.pathname.startsWith(p));
  const isRHActive = ['/equipe'].some(p => location.pathname.startsWith(p));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const path = location.pathname;
    if (['/crm', '/propostas', '/comercial', '/clientes'].some(p => path.startsWith(p))) {
      setOpenGroup('crm');
    } else if (['/obras', '/planejamento', '/diario', '/medicao'].some(p => path.startsWith(p))) {
      setOpenGroup('obras');
    } else if (path.startsWith('/financeiro')) {
      setOpenGroup('finance');
    } else if (['/compras', '/estoque', '/fornecedores', '/servicos'].some(p => path.startsWith(p))) {
      setOpenGroup('suprimentos');
    } else if (path.startsWith('/equipe')) {
      setOpenGroup('rh');
    }
  }, [location.pathname]);

  const navProps = {
    toggleMenu,
    canViewProposals: currentUser?.permissions.viewProposals,
    canViewProjects: currentUser?.permissions.viewProjects,
    canViewFinancial: currentUser?.permissions.viewFinancial,
    canViewTeam: currentUser?.permissions.viewTeam,
    canManageSettings: currentUser?.permissions.manageSettings,
    openGroup, toggleGroup,
    isCRMActive,
    isRHActive,
    handleLogout
  };

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
          <NavContent {...navProps} />
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
              <NavContent mobile={true} {...navProps} />
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
          <div className="flex items-center space-x-3">
            <NotificationBell isDarkBg={true} />
            <button onClick={toggleMenu} className="p-2 text-[#c79229] hover:bg-white/10 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 relative">
          <div className="hidden md:flex justify-end mb-2">
            <NotificationBell isDarkBg={false} />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
