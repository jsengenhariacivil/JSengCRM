```typescript
import React, { useState, useEffect, useRef } from 'react';
import { Save, User, Building, Bell, Plus, Trash2, Shield, Mail, X, CheckSquare, Square, Key, Upload, Image as ImageIcon, Briefcase, Edit, Loader2, Database, Download, TrendingUp } from 'lucide-react';
import { useData, ROLE_DEFINITIONS } from '../context/DataContext';
import { supabase } from '../supabaseClient';
import { UserData, UserPermissions, Goal } from '../types';
import { processSinapiZip, SinapiProcessStatus } from '../utils/sinapiParser';

const Settings: React.FC = () => {
  const {
    companyName, setCompanyName,
    companyLogo, setCompanyLogo,
    companyCNPJ, setCompanyCNPJ,
    companyPhone, setCompanyPhone,
    companyAddress, setCompanyAddress,
    companyEmail, setCompanyEmail,
    users, addUser, updateUser, deleteUser,
    goals, addGoal, updateGoal, deleteGoal
  } = useData();

  const [activeTab, setActiveTab] = useState<'company' | 'users' | 'notifications' | 'sinapi' | 'goals'>('company');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // SINAPI State
  const [sinapiState, setSinapiState] = useState('SP');
  const [sinapiDeson, setSinapiDeson] = useState(false);
  const [sinapiStatus, setSinapiStatus] = useState<SinapiProcessStatus>({ status: 'idle', progress: 0, message: '' });

  const handleSinapiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processSinapiZip(file, sinapiState, sinapiDeson, (status) => {
      setSinapiStatus(status);
    });

    e.target.value = '';
  };

  // Local state for company form
  const [localData, setLocalData] = useState({
    name: companyName,
    cnpj: companyCNPJ,
    phone: companyPhone,
    address: companyAddress,
    email: companyEmail
  });

  useEffect(() => {
    setLocalData({
      name: companyName,
      cnpj: companyCNPJ,
      phone: companyPhone,
      address: companyAddress,
      email: companyEmail
    });
  }, [companyName, companyCNPJ, companyPhone, companyAddress, companyEmail]);

  // Estados para modais
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  // Estado para edição de usuário (Dados gerais)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Engenharia', password: '' });

  // Estado para edição de permissões (Granular)
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<UserData | null>(null);

  // --- GOAL STATES ---
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalForm, setGoalForm] = useState<Partial<Goal>>({
    title: '',
    target: 0,
    current: 0,
    type: 'Financeiro',
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    status: 'Ativa'
  });

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyName(localData.name);
    setCompanyCNPJ(localData.cnpj);
    setCompanyPhone(localData.phone);
    setCompanyAddress(localData.address);
    setCompanyEmail(localData.email);
    alert('Alterações da empresa salvas com sucesso!');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `company_logo_${ Date.now() }.${ fileExt } `;
      const filePath = `${ fileName } `;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setCompanyLogo(publicUrl);
    } catch (error: any) {
      console.error('Error uploading logo:', error.message);
      alert('Erro ao fazer upload da logo. Verifique se o bucket "logos" foi criado como Público.');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Deseja realmente remover a logo da empresa?')) {
      setCompanyLogo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    const rolePermissions = ROLE_DEFINITIONS[userForm.role] || ROLE_DEFINITIONS['Visitante'];

    if (editingUserId) {
      const originalUser = users.find(u => u.id === editingUserId);
      if (!originalUser) return;
      const passwordToSave = userForm.password ? userForm.password : originalUser.password;
      const updatedUser: UserData = {
        ...originalUser,
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        password: passwordToSave,
        permissions: rolePermissions
      };
      updateUser(updatedUser);
    } else {
      const newUser: UserData = {
        id: (users.length + 1 + Math.random()).toString(),
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        permissions: rolePermissions,
        password: userForm.password || '123456'
      };
      addUser(newUser);
    }
    setIsUserModalOpen(false);
  };

  const openAddUserModal = () => {
    setEditingUserId(null);
    setUserForm({ name: '', email: '', role: 'Engenharia', password: '' });
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user: UserData) => {
    setEditingUserId(user.id);
    setUserForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      deleteUser(id);
    }
  };

  // --- GOAL HANDLERS ---
  const openAddGoalModal = () => {
    setEditingGoal(null);
    setGoalForm({
      title: '',
      target: 0,
      current: 0,
      type: 'Financeiro',
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      status: 'Ativa'
    });
    setIsGoalModalOpen(true);
  };

  const openEditGoalModal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      target: goal.target,
      current: goal.current,
      type: goal.type as any,
      deadline: goal.deadline.split('T')[0],
      status: goal.status as any
    });
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await updateGoal({ ...editingGoal, ...goalForm } as Goal);
      } else {
        await addGoal({
          ...goalForm,
          id: Date.now().toString(),
          current: goalForm.current || 0,
          status: 'Ativa'
        } as Goal);
      }
      setIsGoalModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
    }
  };

  const handleOpenPermissions = (user: UserData) => {
    // Clona o objeto para evitar referência direta durante a edição
    setEditingPermissionsUser(JSON.parse(JSON.stringify(user)));
    setIsPermissionsModalOpen(true);
  };

  // Aplica um perfil pré-definido ao usuário em edição
  const applyPresetRole = (roleName: string) => {
    if (!editingPermissionsUser) return;
    const preset = ROLE_DEFINITIONS[roleName];
    if (preset) {
      // Atualiza estado de forma funcional para garantir re-render
      setEditingPermissionsUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          role: roleName,
          permissions: { ...preset }
        };
      });
    }
  };

  const togglePermission = (key: keyof UserPermissions) => {
    if (!editingPermissionsUser) return;

    setEditingPermissionsUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [key]: !prev.permissions[key]
        }
      };
    });
  };

  const savePermissions = () => {
    if (!editingPermissionsUser) return;
    updateUser(editingPermissionsUser);
    setIsPermissionsModalOpen(false);
    setEditingPermissionsUser(null);
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-[#181418]">Configurações</h1>
        <p className="text-slate-500">Gerencie os dados da empresa e permissões de usuários</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('company')}
            className={`px - 6 py - 4 font - medium text - sm flex items - center gap - 2 transition - colors whitespace - nowrap ${
  activeTab === 'company'
    ? 'text-[#c79229] border-b-2 border-[#c79229] font-bold'
    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
} `}
          >
            <Building size={18} />
            Dados da Empresa
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px - 6 py - 4 font - medium text - sm flex items - center gap - 2 transition - colors whitespace - nowrap ${
  activeTab === 'users'
    ? 'text-[#c79229] border-b-2 border-[#c79229] font-bold'
    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
} `}
          >
            <User size={18} />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px - 6 py - 4 font - medium text - sm flex items - center gap - 2 transition - colors whitespace - nowrap ${
  activeTab === 'notifications'
    ? 'text-[#c79229] border-b-2 border-[#c79229] font-bold'
    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
} `}
          >
            <Bell size={18} />
            Notificações
          </button>
          <button
            onClick={() => setActiveTab('sinapi')}
            className={`px - 6 py - 4 font - medium text - sm flex items - center gap - 2 transition - colors whitespace - nowrap ${
  activeTab === 'sinapi'
    ? 'text-[#c79229] border-b-2 border-[#c79229] font-bold'
    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
} `}
          >
            <Database size={18} />
            SINAPI
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px - 6 py - 4 font - medium text - sm flex items - center gap - 2 transition - colors whitespace - nowrap ${
  activeTab === 'goals'
    ? 'text-[#c79229] border-b-2 border-[#c79229] font-bold'
    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
} `}
          >
            <TrendingUp size={18} />
            Metas
          </button>
        </div>

        <div className="p-6 md:p-8">

          {/* TAB: COMPANY DATA */}
          {activeTab === 'company' && (
            <form className="space-y-6 max-w-2xl" onSubmit={handleSaveCompany}>
              {/* Logo Upload Section */}
              <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center">
                <div className="mb-3">
                  {companyLogo ? (
                    <div className="relative group w-fit mx-auto">
                      <img src={companyLogo} alt="Logo" className="h-32 object-contain rounded-lg border border-[#c79229]/30 bg-[#181418] p-2" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg z-10">
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="text-white bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg cursor-pointer"
                          title="Remover Logo"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 w-32 bg-[#181418] rounded-lg flex items-center justify-center text-[#c79229] mx-auto border border-[#c79229]/30">
                      <ImageIcon size={48} />
                    </div>
                  )}
                </div>

                <label className="cursor-pointer bg-[#181418] text-[#c79229] px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-black transition-colors flex items-center gap-2">
                  {isUploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span>{isUploadingLogo ? 'Carregando...' : (companyLogo ? 'Alterar Logo' : 'Carregar Logo')}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    ref={fileInputRef}
                    disabled={isUploadingLogo}
                  />
                </label>
                <p className="text-xs text-slate-500 mt-2">Recomendado: PNG ou JPG com fundo transparente. Visualização em fundo escuro.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    value={localData.name}
                    onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={localData.cnpj}
                    onChange={(e) => setLocalData({ ...localData, cnpj: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={localData.phone}
                    onChange={(e) => setLocalData({ ...localData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    value={localData.address}
                    onChange={(e) => setLocalData({ ...localData, address: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email de Contato</label>
                  <input
                    type="email"
                    value={localData.email}
                    onChange={(e) => setLocalData({ ...localData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-slate-100">
                <button type="submit" className="flex items-center space-x-2 px-6 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm transition-colors">
                  <Save size={18} />
                  <span>Salvar Dados da Empresa</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="max-w-5xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#181418]">Usuários e Permissões</h3>
                <button
                  onClick={openAddUserModal}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  <Plus size={18} /> Adicionar
                </button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Nome</th>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium">Perfil Atual</th>
                      <th className="px-6 py-3 font-medium text-right">Permissões</th>
                      <th className="px-6 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-[#181418] flex items-center gap-3">
                          <div className={`w - 8 h - 8 rounded - full flex items - center justify - center text - xs font - bold ${
  user.role === 'Visitante' ? 'bg-slate-200 text-slate-500' : 'bg-[#181418] text-[#c79229]'
} `}>
                            {user.name.charAt(0)}
                          </div>
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px - 2 py - 1 rounded - full text - xs font - bold ${
  user.role === 'Administrador' ? 'bg-[#c79229]/20 text-[#c79229]' :
    user.role === 'Visitante' ? 'bg-slate-200 text-slate-500' :
      'bg-blue-50 text-blue-600'
} `}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenPermissions(user)}
                            className="text-slate-500 hover:text-[#c79229] transition-colors flex items-center gap-1 ml-auto"
                            title="Gerenciar Permissões"
                          >
                            <Shield size={16} />
                            <span className="text-xs font-medium">Editar Acesso</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditUserModal(user)}
                              className="text-slate-400 hover:text-[#c79229] transition-colors"
                              title="Editar Dados e Senha"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                              title="Remover"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          Nenhum usuário cadastrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <form className="max-w-2xl space-y-8" onSubmit={handleSave}>
              {/* Same content as before */}
              <div>
                <h3 className="text-lg font-bold text-[#181418] mb-4 flex items-center gap-2">
                  <Mail size={20} className="text-[#c79229]" />
                  Alertas por Email
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <span className="text-slate-700 font-medium">Novas propostas recebidas</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#c79229]" />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <span className="text-slate-700 font-medium">Contas a pagar vencendo hoje</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#c79229]" />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <span className="text-slate-700 font-medium">Relatório semanal de desempenho</span>
                    <input type="checkbox" className="w-5 h-5 accent-[#c79229]" />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-slate-100">
                <button type="submit" className="flex items-center space-x-2 px-6 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm transition-colors">
                  <Save size={18} />
                  <span>Salvar Preferências</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: SINAPI */}
          {activeTab === 'sinapi' && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-[#181418] mb-2 flex items-center gap-2">
                  <Database size={20} className="text-[#c79229]" />
                  Importador Oficial SINAPI (CAIXA)
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  Baixe o arquivo ZIP mais recente do portal da Caixa Econômica referente ao seu Estado e importe aqui. O sistema extrairá milhares de Composições e Insumos para o seu banco da nuvem, resolvendo qualquer mudança e mantendo seu sistema rápido.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado (UF) do Arquivo</label>
                    <select
                      value={sinapiState}
                      onChange={(e) => setSinapiState(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                    >
                      <option value="AC">Acre</option><option value="AL">Alagoas</option><option value="AP">Amapá</option><option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option><option value="CE">Ceará</option><option value="DF">Distrito Federal</option><option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option><option value="MA">Maranhão</option><option value="MT">Mato Grosso</option><option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option><option value="PA">Pará</option><option value="PB">Paraíba</option><option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option><option value="PI">Piauí</option><option value="RJ">Rio de Janeiro</option><option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option><option value="RO">Rondônia</option><option value="RR">Roraima</option><option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option><option value="SE">Sergipe</option><option value="TO">Tocantins</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status de Desoneração</label>
                    <select
                      value={sinapiDeson ? 'true' : 'false'}
                      onChange={(e) => setSinapiDeson(e.target.value === 'true')}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                    >
                      <option value="false">Não Desonerado</option>
                      <option value="true">Desonerado</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <a
                    href="https://www.caixa.gov.br/site/paginas/downloads.aspx#categoria_192"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex justify-center items-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg font-medium transition-colors"
                  >
                    <Download size={18} />
                    1. Baixar ZIP na Caixa Oficial
                  </a>

                  <label className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-[#c79229] text-[#181418] hover:bg-[#a67922] rounded-lg font-bold shadow-sm transition-colors cursor-pointer text-center relative overflow-hidden">
                    {sinapiStatus.status === 'extracting' || sinapiStatus.status === 'parsing' || sinapiStatus.status === 'uploading' ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Upload size={18} />
                    )}
                    <span>2. Processar Arquivo ZIP Baixado</span>
                    <input type="file" accept=".zip" className="hidden" onChange={handleSinapiUpload} disabled={sinapiStatus.status === 'extracting' || sinapiStatus.status === 'parsing' || sinapiStatus.status === 'uploading'} />
                  </label>
                </div>

                {sinapiStatus.status !== 'idle' && (
                  <div className="mt-6 p-4 bg-white border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-800">Status do Processamento</span>
                      <span className="text-xs font-medium text-[#c79229]">{sinapiStatus.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div 
                        className={`h - 2.5 rounded - full transition - all duration - 300 ${
  sinapiStatus.status === 'error' ? 'bg-red-500' : sinapiStatus.status === 'done' ? 'bg-green-500' : 'bg-[#c79229]'
} `} 
                        style={{ width: `${ sinapiStatus.progress }% ` }}
                      ></div>
                    </div>
                    <p className={`mt - 2 text - sm ${ sinapiStatus.status === 'error' ? 'text-red-600' : 'text-slate-600' } `}>
                      {sinapiStatus.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: GOALS */}
          {activeTab === 'goals' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#181418]">Metas de Performance</h3>
                  <p className="text-sm text-slate-500">Defina objetivos mensuráveis para sua empresa.</p>
                </div>
                <button
                  type="button"
                  onClick={openAddGoalModal}
                  className="flex items-center gap-2 px-4 py-2 bg-[#c79229] text-[#181418] rounded-lg font-bold shadow-sm hover:bg-[#a67922] transition-colors"
                >
                  <Plus size={18} /> Criar Meta
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map(goal => (
                  <div key={goal.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#c79229] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px - 2 py - 0.5 rounded text - [10px] font - bold uppercase ${
  goal.type === 'Financeiro' ? 'bg-green-100 text-green-700' :
    goal.type === 'Comercial' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
} `}>
                            {goal.type}
                          </span>
                          <span className={`px - 2 py - 0.5 rounded text - [10px] font - bold uppercase ${
  goal.status === 'Ativa' ? 'bg-amber-100 text-amber-700' :
    goal.status === 'Concluída' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
} `}>
                            {goal.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg leading-tight">{goal.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <TrendingUp size={12} /> Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEditGoalModal(goal)}
                          className="p-2 text-slate-400 hover:text-[#c79229] hover:bg-slate-50 rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Excluir esta meta?')) deleteGoal(goal.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Progresso</span>
                        <span className="font-bold text-[#c79229]">
                          {((goal.current / goal.target) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-[#c79229] to-[#e0a838] h-3 rounded-full transition-all duration-1000 shadow-inner"
                          style={{ width: `${ Math.min((goal.current / goal.target) * 100, 100) }% ` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs p-2 bg-slate-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-slate-400 uppercase text-[9px] font-bold">Atual</p>
                          <p className="font-bold text-slate-700">{goal.type === 'Financeiro' ? `R$ ${ goal.current.toLocaleString() } ` : goal.current}</p>
                        </div>
                        <div className="text-center border-l border-slate-200 pl-4">
                          <p className="text-slate-400 uppercase text-[9px] font-bold">Alvo</p>
                          <p className="font-bold text-slate-700">{goal.type === 'Financeiro' ? `R$ ${ goal.target.toLocaleString() } ` : goal.target}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {goals.length === 0 && (
                  <div className="col-span-2 py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <TrendingUp size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Nenhuma meta estratégica definida.</p>
                    <button onClick={openAddGoalModal} className="mt-4 text-[#c79229] font-bold hover:underline">
                      Comece criando sua primeira meta agora
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setIsUserModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-[#181418]">
                {editingUserId ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Profissional</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  placeholder="Ex: joao@jseng.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {editingUserId ? 'Nova Senha' : 'Senha Provisória'}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  placeholder={editingUserId ? "Deixe em branco para não alterar" : "Se vazio, padrão: 123456"}
                />
                {editingUserId && (
                  <p className="text-xs text-slate-500 mt-1">Preencha apenas se desejar redefinir a senha do usuário.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Perfil</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                >
                  {Object.keys(ROLE_DEFINITIONS).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  {editingUserId ? "Atenção: Alterar o perfil resetará as permissões personalizadas para o padrão do novo perfil." : ""}
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c79229] text-[#181418] hover:bg-[#a67922] rounded-lg font-bold shadow-sm flex items-center gap-2"
                >
                  <User size={18} />
                  <span>{editingUserId ? 'Salvar Alterações' : 'Cadastrar Usuário'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERMISSIONS MODAL */}
      {isPermissionsModalOpen && editingPermissionsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setIsPermissionsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#181418] flex items-center justify-center text-[#c79229] font-bold">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#181418]">Permissões de Acesso</h3>
                  <p className="text-xs text-slate-500">{editingPermissionsUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">

              {/* PRESET ROLE SELECTOR */}
              <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-sm font-bold text-[#181418] mb-2 flex items-center gap-2">
                  <Briefcase size={16} className="text-[#c79229]" />
                  Aplicar Perfil Pré-definido
                </label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#c79229] text-slate-900"
                    value={editingPermissionsUser.role}
                    onChange={(e) => applyPresetRole(e.target.value)}
                  >
                    {Object.keys(ROLE_DEFINITIONS).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <button
                    className="px-3 py-2 bg-[#c79229] text-[#181418] font-bold text-sm rounded-lg hover:bg-[#a67922]"
                    onClick={() => applyPresetRole(editingPermissionsUser.role)}
                  >
                    Aplicar
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Selecionar um perfil atualizará automaticamente as permissões abaixo. Você pode personalizá-las depois.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-500 mb-2 font-medium">Controle Manual:</p>

                <div
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => togglePermission('viewFinancial')}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">Visualizar Financeiro</span>
                    <span className="text-xs text-slate-500">Acesso a receitas, despesas e dashboards financeiros.</span>
                  </div>
                  <div className="text-[#c79229]">
                    {editingPermissionsUser.permissions.viewFinancial ? <CheckSquare size={24} /> : <Square size={24} className="text-slate-300" />}
                  </div>
                </div>

                <div
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => togglePermission('editFinancial')}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">Editar Financeiro</span>
                    <span className="text-xs text-slate-500">Adicionar e editar transações e pagamentos.</span>
                  </div>
                  <div className="text-[#c79229]">
                    {editingPermissionsUser.permissions.editFinancial ? <CheckSquare size={24} /> : <Square size={24} className="text-slate-300" />}
                  </div>
                </div>

                <div
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => togglePermission('viewProjects')}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">Visualizar Obras</span>
                    <span className="text-xs text-slate-500">Ver lista de projetos e status.</span>
                  </div>
                  <div className="text-[#c79229]">
                    {editingPermissionsUser.permissions.viewProjects ? <CheckSquare size={24} /> : <Square size={24} className="text-slate-300" />}
                  </div>
                </div>

                <div
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => togglePermission('editProjects')}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">Gerenciar Obras</span>
                    <span className="text-xs text-slate-500">Criar obras, editar cronogramas e orçamentos.</span>
                  </div>
                  <div className="text-[#c79229]">
                    {editingPermissionsUser.permissions.editProjects ? <CheckSquare size={24} /> : <Square size={24} className="text-slate-300" />}
                  </div>
                </div>

                <div
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => togglePermission('viewProposals')}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">Visualizar Propostas</span>
                    <span className="text-xs text-slate-500">Ver orçamentos, etapas e kanban.</span>
                  </div>
                  <div className="text-[#c79229]">
                    {editingPermissionsUser.permissions.viewProposals ? <CheckSquare size={24} /> : <Square size={24} className="text-slate-300" />}
                  </div>
                </div>

                <div
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => togglePermission('editProposals')}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">Gerenciar Propostas</span>
                    <span className="text-xs text-slate-500">Criar novos orçamentos, importar planilhas e editar.</span>
                  </div>
                  <div className="text-[#c79229]">
                    {editingPermissionsUser.permissions.editProposals ? <CheckSquare size={24} /> : <Square size={24} className="text-slate-300" />}
                  </div>
                </div>

                <div
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => togglePermission('viewTeam')}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">Visualizar Equipe</span>
                    <span className="text-xs text-slate-500">Acesso a aba equipe, RH e funcionários.</span>
                  </div>
                  <div className="text-[#c79229]">
                    {editingPermissionsUser.permissions.viewTeam ? <CheckSquare size={24} /> : <Square size={24} className="text-slate-300" />}
                  </div>
                </div>

                <div
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => togglePermission('manageSettings')}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">Configurações do Sistema</span>
                    <span className="text-xs text-slate-500">Acesso a usuários, dados da empresa e permissões.</span>
                  </div>
                  <div className="text-[#c79229]">
                    {editingPermissionsUser.permissions.manageSettings ? <CheckSquare size={24} /> : <Square size={24} className="text-slate-300" />}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePermissions}
                  className="px-6 py-2 bg-[#c79229] text-[#181418] hover:bg-[#a67922] rounded-lg font-bold shadow-sm"
                >
                  Salvar Permissões
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GOAL MODAL */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setIsGoalModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-[#181418]">
                {editingGoal ? 'Editar Meta' : 'Criar Nova Meta'}
              </h3>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título da Meta</label>
                <input
                  type="text"
                  required
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  placeholder="Ex: Faturamento Mensal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={goalForm.type}
                    onChange={(e) => setGoalForm({ ...goalForm, type: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  >
                    <option value="Financeiro">Financeiro</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Operacional">Operacional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={goalForm.status}
                    onChange={(e) => setGoalForm({ ...goalForm, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  >
                    <option value="Ativa">Ativa</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Expirada">Expirada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Alvo</label>
                  <input
                    type="number"
                    required
                    value={goalForm.target}
                    onChange={(e) => setGoalForm({ ...goalForm, target: parseFloat(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Atual</label>
                  <input
                    type="number"
                    required
                    value={goalForm.current}
                    onChange={(e) => setGoalForm({ ...goalForm, current: parseFloat(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Prazo</label>
                <input
                  type="date"
                  required
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#c79229] text-[#181418] hover:bg-[#a67922] rounded-lg font-bold shadow-sm flex items-center gap-2"
                >
                  <Save size={18} />
                  <span>{editingGoal ? 'Salvar Alterações' : 'Criar Meta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
