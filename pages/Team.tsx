
import React, { useState } from 'react';
import { User, UserCog, Calendar, Banknote, Plus, Search, MoreVertical, Phone, Mail, X, Save, Trash2, Edit } from 'lucide-react';
import { useData } from '../context/DataContext';
import { TeamMember, PaymentRecord, Status } from '../types';

interface TeamProps {
  view: 'employees' | 'contractors' | 'payments';
}

// Listas de cargos pré-definidos para sugestão
const CONSTRUCTION_ROLES = [
  "Pedreiro", "Servente", "Mestre de Obras", "Eletricista", "Encanador",
  "Pintor", "Gesseiro", "Serralheiro", "Carpinteiro", "Azulejista",
  "Vidraceiro", "Marceneiro", "Jardineiro"
];

const OFFICE_ROLES = [
  "Engenheiro Civil", "Arquiteto", "Estagiário de Engenharia",
  "Técnico em Edificações", "Administrativo", "Financeiro",
  "Gerente de Projetos", "Comprador", "Orçamentista", "RH"
];

// Referências de pagamento padrão
const DEFAULT_PAYMENT_REFS = [
  "Salário Mensal",
  "Adiantamento Quinzenal",
  "Pagamento de Diária",
  "Reembolso de Materiais",
  "Vale Transporte",
  "Vale Alimentação",
  "13º Salário",
  "Férias",
  "Rescisão",
  "Bônus por Meta"
];

const Team: React.FC<TeamProps> = ({ view }) => {
  const { teamMembers, suppliers, addTeamMember, updateTeamMember, deleteTeamMember, payments, addPayment, updatePayment, deletePayment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  React.useEffect(() => {
    // Check constraints if possible
  }, []);

  // Filtra membros com base na view
  const employees = teamMembers.filter(m => m.type === 'CLT' || m.type === 'PJ' || m.type === 'Estagio' || m.type === 'Estágio' || m.type === 'Funcionário');
  const contractors = teamMembers.filter(m => m.type === 'Prestador' || m.type === 'Empresa' || m.type === 'Fornecedor');

  // Estado para armazenar referências usadas
  const [savedReferences, setSavedReferences] = useState<string[]>(DEFAULT_PAYMENT_REFS);

  // --- FORM DATA ---
  const [formData, setFormData] = useState<any>({
    name: '',
    role: '',
    email: '',
    phone: '',
    type: 'CLT',
    status: 'Ativo',
    // Payment specific fields
    reference: '',
    date: '',
    value: 0
  });

  // --- HELPERS ---
  const getHeader = () => {
    switch (view) {
      case 'employees': return { title: 'Funcionários', desc: 'Gestão da equipe interna', icon: User, btn: 'Novo Funcionário' };
      case 'contractors': return { title: 'Prestadores', desc: 'Gestão de terceirizados e parceiros', icon: UserCog, btn: 'Novo Prestador' };
      case 'payments': return { title: 'Pagamentos', desc: 'Folha e pagamentos de serviços', icon: Banknote, btn: 'Novo Pagamento' };
      default: return { title: 'Equipe', desc: 'Gestão de recursos humanos', icon: User, btn: 'Novo' };
    }
  };
  const headerInfo = getHeader();

  const roleSuggestions = view === 'employees'
    ? [...OFFICE_ROLES, ...CONSTRUCTION_ROLES]
    : CONSTRUCTION_ROLES;

  // --- HANDLERS ---
  const handleOpenNew = () => {
    setEditingId(null);

    if (view === 'payments') {
      setFormData({
        name: '',
        reference: '',
        date: new Date().toISOString().split('T')[0],
        value: 0,
        status: Status.PENDING
      });
    } else {
      setFormData({
        name: '',
        role: '',
        email: '',
        phone: '',
        type: view === 'employees' ? 'CLT' : 'Prestador',
        status: view === 'employees' ? 'Ativo' : 'Disponível'
      });
    }
    setIsModalOpen(true);
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (view === 'payments') {
        const paymentData: PaymentRecord = {
          id: editingId || (Date.now()).toString(),
          name: formData.name,
          reference: formData.reference,
          date: formData.date,
          value: Number(formData.value),
          status: formData.status
        };

        if (formData.reference && !savedReferences.includes(formData.reference)) {
          setSavedReferences(prev => [...prev, formData.reference].sort());
        }

        if (editingId) {
          await updatePayment(paymentData);
        } else {
          await addPayment(paymentData);
        }

      } else {
        const memberData: TeamMember = {
          id: editingId || (Date.now()).toString(),
          name: formData.name || '',
          role: formData.role || '',
          email: formData.email || '',
          phone: formData.phone || '',
          type: formData.type || '',
          status: formData.status || 'Ativo'
        };

        if (editingId) {
          await updateTeamMember(memberData);
        } else {
          await addTeamMember(memberData);
        }
      }

      setIsModalOpen(false);
      setEditingId(null);
    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      if (view === 'payments') {
        await deletePayment(id);
      } else {
        await deleteTeamMember(id);
      }
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // --- RENDER CONTENT ---
  const renderList = () => {
    const data = view === 'employees' ? employees : contractors;

    const filteredData = data.filter(item =>
      (item.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (item.role || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (item.email || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" onClick={() => setOpenMenuId(null)}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Cargo/Função</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Vínculo</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#c79229] font-bold text-xs">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#181418]">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.role}</td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    <div>{item.phone}</div>
                    <div className="text-xs">{item.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-slate-400">{item.type}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${['Ativo', 'Disponível'].includes(item.status) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={(e) => toggleMenu(item.id, e)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === item.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-1">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Edit size={16} /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={16} /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            Nenhum membro encontrado.
          </div>
        )}
      </div>
    );
  };

  const renderOtherViews = () => {
    if (view === 'payments') {
      const filteredPayments = payments.filter(p =>
        (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (p.reference || '').toLowerCase().includes((searchTerm || '').toLowerCase())
      );

      return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" onClick={() => setOpenMenuId(null)}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Beneficiário</th>
                  <th className="px-6 py-4">Referência</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4 font-medium text-[#181418] whitespace-nowrap">{payment.name}</td>
                    <td className="px-6 py-4 text-slate-500">{payment.reference}</td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#181418] whitespace-nowrap">R$ {payment.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${payment.status === Status.PAID ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button onClick={(e) => toggleMenu(payment.id, e)} className="text-slate-400 hover:text-slate-600 transition-opacity">
                          <MoreVertical size={18} />
                        </button>
                        {openMenuId === payment.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-1">
                            <button onClick={() => handleEditClick(payment)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              <Edit size={16} /> Editar
                            </button>
                            <button onClick={() => handleDelete(payment.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                              <Trash2 size={16} /> Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPayments.length === 0 && (
            <div className="p-8 text-center text-slate-500">Nenhum pagamento encontrado.</div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181418] flex items-center gap-3">
            <headerInfo.icon className="text-[#c79229]" size={28} />
            {headerInfo.title}
          </h1>
          <p className="text-slate-500">{headerInfo.desc}</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center space-x-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>{headerInfo.btn}</span>
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input
          type="text"
          placeholder={`Buscar em ${headerInfo.title.toLowerCase()}...`}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#c79229] outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {(view === 'employees' || view === 'contractors') && renderList()}
      {(view === 'payments') && renderOtherViews()}

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-[#181418]">
                {editingId ? 'Editar' : 'Novo'} {view === 'payments' ? 'Pagamento' : (view === 'employees' ? 'Funcionário' : 'Prestador')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">

              {/* FORMULÁRIO PARA FUNCIONÁRIOS E PRESTADORES */}
              {view !== 'payments' && (
                <div className="space-y-6">
                  {/* Seção: Dados Pessoais */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Dados Pessoais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                        <input
                          type="text"
                          placeholder="000.000.000-00"
                          value={formData.document_cpf || ''}
                          onChange={(e) => setFormData({ ...formData, document_cpf: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">RG</label>
                        <input
                          type="text"
                          value={formData.document_rg || ''}
                          onChange={(e) => setFormData({ ...formData, document_rg: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                        <input
                          type="date"
                          value={formData.birth_date || ''}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                        <select
                          value={formData.gender || ''}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        >
                          <option value="">Selecione...</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Seção: Endereço e Contato */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Endereço e Contato</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                        <input
                          type="text"
                          placeholder="Rua, número, bairro, cidade, UF"
                          value={formData.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                        <input
                          type="text"
                          placeholder="(00) 00000-0000"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contato de Emergência</label>
                        <input
                          type="text"
                          placeholder="Nome - Telefone"
                          value={formData.emergency_contact || ''}
                          onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção: Profissional */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Dados Profissionais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {view === 'employees' ? 'Cargo / Função' : 'Especialidade'}
                        </label>
                        <input
                          list="roles-list"
                          type="text"
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                          placeholder="Selecione ou digite..."
                        />
                        <datalist id="roles-list">
                          {roleSuggestions.map((role, index) => (
                            <option key={index} value={role} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data de Admissão</label>
                        <input
                          type="date"
                          value={formData.admission_date || ''}
                          onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vínculo</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        >
                          {view === 'employees' ? (
                            <>
                              <option value="CLT">CLT</option>
                              <option value="PJ">PJ</option>
                              <option value="Estagio">Estágio</option>
                              <option value="Funcionário">Funcionário</option>
                            </>
                          ) : (
                            <>
                              <option value="Prestador">Prestador</option>
                              <option value="Empresa">Empresa</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        >
                          {view === 'employees' ? (
                            <>
                              <option value="Ativo">Ativo</option>
                              <option value="Férias">Férias</option>
                              <option value="Inativo">Inativo</option>
                            </>
                          ) : (
                            <>
                              <option value="Disponível">Disponível</option>
                              <option value="Em Obra">Em Obra</option>
                              <option value="Indisponível">Indisponível</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Seção: Pagamento */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Informações Bancárias / Pix</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Chave Pix</label>
                        <input
                          type="text"
                          placeholder="CPF, Email, Celular ou Aleatória"
                          value={formData.bank_pix || ''}
                          onChange={(e) => setFormData({ ...formData, bank_pix: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dados Bancários (Opcional)</label>
                        <input
                          type="text"
                          placeholder="Banco, Agência, Conta"
                          value={formData.bank_info || ''}
                          onChange={(e) => setFormData({ ...formData, bank_info: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FORMULÁRIO ESPECÍFICO PARA PAGAMENTOS */}
              {view === 'payments' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Beneficiário</label>
                    <select
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                    >
                      <option value="">Selecione um beneficiário...</option>

                      <optgroup label="Funcionários">
                        {employees.map(emp => (
                          <option key={`emp-${emp.id}`} value={emp.name}>{emp.name} ({emp.role})</option>
                        ))}
                      </optgroup>

                      <optgroup label="Prestadores">
                        {contractors.map(cont => (
                          <option key={`cont-${cont.id}`} value={cont.name}>{cont.name} ({cont.role})</option>
                        ))}
                      </optgroup>

                      <optgroup label="Fornecedores">
                        {suppliers.map(sup => (
                          <option key={`sup-${sup.id}`} value={sup.name}>{sup.name} (Fornecedor)</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Referência</label>
                    <input
                      list="payment-references-list"
                      type="text"
                      required
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                      placeholder="Ex: Salário Mensal, Diária..."
                    />
                    <datalist id="payment-references-list">
                      {savedReferences.map((ref, idx) => (
                        <option key={idx} value={ref} />
                      ))}
                    </datalist>
                    <p className="text-xs text-slate-400 mt-1">Selecione da lista ou digite para criar uma nova referência.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                    >
                      <option value={Status.PENDING}>{Status.PENDING}</option>
                      <option value="Agendado">Agendado</option>
                      <option value={Status.PAID}>{Status.PAID}</option>
                    </select>
                  </div>
                </div>
              )}
            </form>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                type="button"
                className="px-4 py-2 bg-[#c79229] text-[#181418] hover:bg-[#a67922] rounded-lg font-bold shadow-sm flex items-center gap-2"
              >
                <Save size={18} />
                <span>{editingId ? 'Salvar Alterações' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
