
import React, { useState, useEffect, useRef } from 'react';
import { Save, User, Building, Bell, Plus, Trash2, Shield, Mail, X, CheckSquare, Square, Key, Upload, Image as ImageIcon, Briefcase, Edit } from 'lucide-react';
import { useData, ROLE_DEFINITIONS } from '../context/DataContext';
import { UserData, UserPermissions } from '../types';

const Settings: React.FC = () => {
  const { 
    companyName, setCompanyName, 
    companyLogo, setCompanyLogo,
    companyCNPJ, setCompanyCNPJ,
    companyPhone, setCompanyPhone,
    companyAddress, setCompanyAddress,
    companyEmail, setCompanyEmail,
    users, addUser, updateUser, deleteUser
  } = useData();

  const [activeTab, setActiveTab] = useState<'company' | 'users' | 'notifications'>('company');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Engenharia', password: '' });
  
  // Estado para edição de permissões (Granular)
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<UserData | null>(null);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyName(localData.name);
    setCompanyCNPJ(localData.cnpj);
    setCompanyPhone(localData.phone);
    setCompanyAddress(localData.address);
    setCompanyEmail(localData.email);
    alert('Alterações da empresa salvas com sucesso!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       const reader = new FileReader();
       reader.onloadend = () => {
          setCompanyLogo(reader.result as string);
       };
       reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
     e.preventDefault();
     e.stopPropagation();
     
     if(window.confirm('Deseja realmente remover a logo da empresa?')) {
        setCompanyLogo(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
     }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Alterações salvas com sucesso!');
  };

  // --- USER MANAGEMENT HANDLERS ---

  const openAddUserModal = () => {
    setEditingUserId(null);
    setUserForm({ name: '', email: '', role: 'Engenharia', password: '' });
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user: UserData) => {
    setEditingUserId(user.id);
    setUserForm({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '' // Senha começa vazia na edição (só preenche se quiser mudar)
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    // Busca permissões pré-definidas com base no cargo selecionado
    const rolePermissions = ROLE_DEFINITIONS[userForm.role] || ROLE_DEFINITIONS['Visitante'];

    if (editingUserId) {
        // --- MODO EDIÇÃO ---
        const originalUser = users.find(u => u.id === editingUserId);
        if (!originalUser) return;

        // Se a senha estiver vazia no form, mantém a antiga. Se tiver algo, atualiza.
        const passwordToSave = userForm.password ? userForm.password : originalUser.password;

        const updatedUser: UserData = {
            ...originalUser,
            name: userForm.name,
            email: userForm.email,
            role: userForm.role,
            password: passwordToSave,
            // Ao mudar o perfil/role no modal de edição básica, resetamos as permissões para o padrão daquele perfil
            permissions: rolePermissions 
        };

        updateUser(updatedUser);
    } else {
        // --- MODO CRIAÇÃO ---
        const newUser: UserData = {
            id: users.length + 1 + Math.random(),
            name: userForm.name,
            email: userForm.email,
            role: userForm.role,
            permissions: rolePermissions,
            password: userForm.password || '123456'
        };
        addUser(newUser);
    }

    setIsUserModalOpen(false);
    setUserForm({ name: '', email: '', role: 'Engenharia', password: '' }); 
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      deleteUser(id);
    }
  };

  // --- PERMISSIONS MANAGEMENT HANDLERS ---

  const handleOpenPermissions = (user: UserData) => {
    // Clona o objeto para evitar referência direta durante a edição
    setEditingPermissionsUser(JSON.parse(JSON.stringify(user))); 
    setIsPermissionsModalOpen(true);
  };

  // Aplica um perfil pré-definido ao usuário em edição
  const applyPresetRole = (roleName: string) => {
      if(!editingPermissionsUser) return;
      const preset = ROLE_DEFINITIONS[roleName];
      if(preset) {
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
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'company' 
                ? 'text-[#c79229] border-b-2 border-[#c79229] font-bold' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Building size={18} />
            Dados da Empresa
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'users' 
                ? 'text-[#c79229] border-b-2 border-[#c79229] font-bold' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <User size={18} />
            Usuários e Permissões
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'notifications' 
                ? 'text-[#c79229] border-b-2 border-[#c79229] font-bold' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bell size={18} />
            Notificações
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
                    <Upload size={16} />
                    <span>{companyLogo ? 'Alterar Logo' : 'Carregar Logo'}</span>
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        ref={fileInputRef}
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
                    onChange={(e) => setLocalData({...localData, name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                  <input 
                    type="text" 
                    value={localData.cnpj}
                    onChange={(e) => setLocalData({...localData, cnpj: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input 
                    type="text" 
                    value={localData.phone}
                    onChange={(e) => setLocalData({...localData, phone: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900" 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                  <input 
                    type="text" 
                    value={localData.address}
                    onChange={(e) => setLocalData({...localData, address: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-[#c79229] outline-none text-slate-900" 
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email de Contato</label>
                  <input 
                    type="email" 
                    value={localData.email}
                    onChange={(e) => setLocalData({...localData, email: e.target.value})}
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
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              user.role === 'Visitante' ? 'bg-slate-200 text-slate-500' : 'bg-[#181418] text-[#c79229]'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            user.role === 'Administrador' ? 'bg-[#c79229]/20 text-[#c79229]' : 
                            user.role === 'Visitante' ? 'bg-slate-200 text-slate-500' :
                            'bg-blue-50 text-blue-600'
                          }`}>
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
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
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
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
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
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
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
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
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
                        <Briefcase size={16} className="text-[#c79229]"/>
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
                      <div className={`text-[#c79229]`}>
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
                      <div className={`text-[#c79229]`}>
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
                      <div className={`text-[#c79229]`}>
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
                      <div className={`text-[#c79229]`}>
                         {editingPermissionsUser.permissions.editProjects ? <CheckSquare size={24} /> : <Square size={24} className="text-slate-300" />}
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
                      <div className={`text-[#c79229]`}>
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
    </div>
  );
};

export default Settings;
