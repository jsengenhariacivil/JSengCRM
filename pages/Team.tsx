
import React, { useState } from 'react';
import { User, UserCog, Calendar, Banknote, Plus, Search, MoreVertical, Phone, Mail, X, Save, Trash2, Edit } from 'lucide-react';
import { useData } from '../context/DataContext';
import { TeamMember, PaymentRecord, Status } from '../types';
import PontoModal from '../components/PontoModal';
import { Clock } from 'lucide-react';

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
  "Gerente de Projetos", "Comprador", "Orçamentista", "RH", "Engenheiro de Segurança", "Técnico de Segurança (TST)"
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
  const { teamMembers, suppliers, addTeamMember, updateTeamMember, deleteTeamMember, payments, addPayment, updatePayment, deletePayment, addTimePunch } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [punchEmployee, setPunchEmployee] = useState<TeamMember | null>(null);
  const [showBulkPunchModal, setShowBulkPunchModal] = useState(false);
  const [bulkDates, setBulkDates] = useState({ 
    start: new Date().toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });

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
    value: 0,
    paymentType: 'mensal',
    dailyRate: 0,
    base_salary: 0,
    bonus: 0,
    cesta_basica: 0,
    lunch_allowance: 0,
    breakfast_allowance: 0,
    work_schedule: 'seg_sex'
  });

  // --- HELPERS ---
  const calcWorkingDaysInMonth = (year: number, month: number, schedule: string) => {
    let count = 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month - 1, i);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0) { // Not Sunday
        if (schedule === 'seg_sex' && dayOfWeek === 6) continue;
        count++;
      }
    }
    return count;
  };

  const calculateDailyValue = (emp: TeamMember, dateStr: string) => {
    if (['CLT', 'Funcionário'].includes(emp.type)) {
      const dateObj = new Date(dateStr + 'T12:00:00');
      const workingDays = calcWorkingDaysInMonth(dateObj.getFullYear(), dateObj.getMonth() + 1, emp.work_schedule || 'seg_sex');
      const salary = emp.base_salary || 0;
      const bonus = emp.bonus || 0;
      const cesta = emp.cesta_basica || 0; 
      const fixedMonthly = salary + bonus + cesta;
      const dailySalary = workingDays > 0 ? (fixedMonthly / workingDays) : 0;
      
      const lunch = emp.lunch_allowance || 0;
      const breakfast = emp.breakfast_allowance || 0;
      
      return dailySalary + lunch + breakfast;
    }
    return Number(emp.dailyRate) || 0;
  };

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
        const paymentData: any = {
          name: formData.name,
          reference: formData.reference,
          date: formData.date,
          value: Number(formData.value),
          status: formData.status
        };
        if (editingId) paymentData.id = editingId;

        if (formData.reference && !savedReferences.includes(formData.reference)) {
          setSavedReferences(prev => [...prev, formData.reference].sort());
        }

        if (editingId) {
          await updatePayment(paymentData);
        } else {
          await addPayment(paymentData);
        }

      } else {
        const memberData: any = {
          name: formData.name || '',
          role: formData.role || '',
          email: formData.email || '',
          phone: formData.phone || '',
          type: formData.type || (view === 'employees' ? 'CLT' : 'Prestador'),
          status: formData.status || 'Ativo',
          document_cpf: formData.document_cpf || '',
          document_rg: formData.document_rg || '',
          birth_date: formData.birth_date || null,
          gender: formData.gender || null,
          address: formData.address || '',
          emergency_contact: formData.emergency_contact || '',
          admission_date: formData.admission_date || null,
          bank_pix: formData.bank_pix || '',
          bank_info: formData.bank_info || '',
          dailyRate: Number(formData.dailyRate) || 0,
          paymentType: formData.paymentType || 'mensal'
        };
        if (editingId) memberData.id = editingId;

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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Cargo/Função</th>
                <th className="px-6 py-4">CPF / Documento</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Pagamento/PIX</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#c79229] font-bold text-xs">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#181418]">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.role}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                    {item.document_cpf || '---'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {item.phone}</div>
                    <div className="text-xs truncate max-w-[150px]">{item.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="text-xs font-semibold text-[#c79229] truncate max-w-[120px]">{item.bank_pix || '---'}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.bank_info}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${['Ativo', 'Disponível'].includes(item.status) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-2 text-slate-400 hover:text-[#c79229] hover:bg-[#c79229]/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setPunchEmployee(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ponto / Atividades"
                      >
                        <Clock size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Beneficiário</th>
                  <th className="px-6 py-4">Referência</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
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
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(payment)} className="p-2 text-slate-400 hover:text-[#c79229] hover:bg-[#c79229]/10 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(payment.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
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
    <div className="space-y-6 relative min-h-screen pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181418] flex items-center gap-3">
            <headerInfo.icon className="text-[#c79229]" size={28} />
            {headerInfo.title}
          </h1>
          <p className="text-slate-500">{headerInfo.desc}</p>
        </div>
        <div className="flex gap-2">
          {view === 'employees' && (
            <button
              onClick={() => setShowBulkPunchModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg hover:bg-emerald-200 shadow-sm transition-colors"
            >
              <Clock size={18} />
              <span>Preencher Presença Todos</span>
            </button>
          )}
          <button
            onClick={handleOpenNew}
            className="flex items-center space-x-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm transition-colors"
          >
            <Plus size={18} />
            <span>{headerInfo.btn}</span>
          </button>
        </div>
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

      {/* PAINEL LATERAL (RIGHT DRAWER) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xl bg-white shadow-2xl h-screen flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-[#181418]">
                  {editingId ? 'Editar' : 'Novo'} {view === 'payments' ? 'Pagamento' : (view === 'employees' ? 'Funcionário' : 'Prestador')}
                </h3>
                <p className="text-xs text-slate-500">Preencha as informações abaixo</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSave} className="space-y-8">

                {/* FORMULÁRIO PARA FUNCIONÁRIOS E PRESTADORES */}
                {view !== 'payments' && (
                  <div className="space-y-8">
                    {/* Seção: Dados Pessoais */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="w-1 h-4 bg-[#c79229] rounded-full" />
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Dados Pessoais</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              {formData.type === 'Empresa' ? 'CNPJ' : (view === 'contractors' ? 'CPF / CNPJ' : 'CPF')}
                            </label>
                            <input
                              type="text"
                              placeholder={formData.type === 'Empresa' ? '00.000.000/0000-00' : '000.000.000-00'}
                              value={formData.document_cpf || ''}
                              onChange={(e) => setFormData({ ...formData, document_cpf: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              {formData.type === 'Empresa' ? 'Inscrição Estadual / RG' : 'RG'}
                            </label>
                            <input
                              type="text"
                              placeholder="MG-00.000.000"
                              value={formData.document_rg || ''}
                              onChange={(e) => setFormData({ ...formData, document_rg: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nasc.</label>
                            <input
                              type="date"
                              value={formData.birth_date || ''}
                              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                            <select
                              value={formData.gender || ''}
                              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                            >
                              <option value="">Selecione...</option>
                              <option value="Masculino">Masculino</option>
                              <option value="Feminino">Feminino</option>
                              <option value="Outro">Outro</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seção: Endereço e Contato */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="w-1 h-4 bg-[#c79229] rounded-full" />
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Endereço e Contato</h4>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                          <input
                            type="text"
                            placeholder="Rua, número, bairro, cidade, UF"
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                            <input
                              type="text"
                              placeholder="(00) 00000-0000"
                              value={formData.phone || ''}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                            <input
                              type="email"
                              placeholder="email@exemplo.com"
                              value={formData.email || ''}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Contato de Emergência</label>
                          <input
                            type="text"
                            placeholder="Nome (Parente) - (00) 00000-0000"
                            value={formData.emergency_contact || ''}
                            onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seção: Profissional */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="w-1 h-4 bg-[#c79229] rounded-full" />
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Dados Profissionais</h4>
                      </div>
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
                            className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
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
                            className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Vínculo</label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
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
                            className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
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
                      
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mt-6">
                        <div className="w-1 h-4 bg-[#c79229] rounded-full" />
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Vínculo e Pagamento</h4>
                      </div>
                      
                      {['CLT', 'Funcionário'].includes(formData.type) ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Salário Fixo Mensal (R$)</label>
                              <input type="number" min="0" step="0.01" value={formData.base_salary || ''} onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Jornada de Trabalho</label>
                              <select value={formData.work_schedule || 'seg_sex'} onChange={(e) => setFormData({ ...formData, work_schedule: e.target.value })} className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none">
                                <option value="seg_sex">Segunda a Sexta</option>
                                <option value="seg_sab">Segunda a Sábado</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Diário do Almoço (R$)</label>
                              <input type="number" min="0" step="0.01" value={formData.lunch_allowance || ''} onChange={(e) => setFormData({ ...formData, lunch_allowance: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Diário do Café (R$)</label>
                              <input type="number" min="0" step="0.01" value={formData.breakfast_allowance || ''} onChange={(e) => setFormData({ ...formData, breakfast_allowance: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Cesta Básica Mensal (R$)</label>
                              <input type="number" min="0" step="0.01" value={formData.cesta_basica || ''} onChange={(e) => setFormData({ ...formData, cesta_basica: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Bônus/Prêmio Mensal (R$)</label>
                              <input type="number" min="0" step="0.01" value={formData.bonus || ''} onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Pagamento</label>
                            <select
                              value={formData.paymentType || 'mensal'}
                              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                            >
                              <option value="mensal">Mensal (Salário)</option>
                              <option value="quinzenal">Quinzenal</option>
                              <option value="diaria">Diária</option>
                              <option value="hora">Por Hora</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Vínculo (R$)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.dailyRate || ''}
                              onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                              className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                              placeholder="Ex: 2500.00, 150.00"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Seção: Pagamento */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="w-1 h-4 bg-[#c79229] rounded-full" />
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pagamento / Pix</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Chave PIX</label>
                          <input
                            type="text"
                            placeholder="CPF, E-mail ou Celular"
                            value={formData.bank_pix || ''}
                            onChange={(e) => setFormData({ ...formData, bank_pix: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Instruções Bancárias</label>
                          <textarea
                            placeholder="Banco, Agência, Conta e outros detalhes..."
                            value={formData.bank_info || ''}
                            onChange={(e) => setFormData({ ...formData, bank_info: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none min-h-[80px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FORMULÁRIO PARA PAGAMENTOS */}
                {view === 'payments' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Beneficiário</label>
                      <select
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                      >
                        <option value="">Selecione...</option>
                        <optgroup label="Equipe">
                          {[...employees, ...contractors].map(m => (
                            <option key={m.id} value={m.name}>{m.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Fornecedores">
                          {suppliers.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Referência / Motivo</label>
                      <input
                        type="text"
                        required
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                        placeholder="Ex: Salário, Material, Adiantamento..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
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
                          className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                      >
                        <option value={Status.PENDING}>Pendente</option>
                        <option value="Agendado">Agendado</option>
                        <option value={Status.PAID}>Pago</option>
                      </select>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold transition-colors uppercase text-xs tracking-widest"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                type="button"
                className="flex-[2] px-4 py-3 bg-[#c79229] text-[#181418] hover:bg-[#a67922] rounded-xl font-bold shadow-lg shadow-[#c79229]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Save size={20} />
                <span>SALVAR ALTERAÇÕES</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {punchEmployee && (
        <PontoModal employee={punchEmployee} onClose={() => setPunchEmployee(null)} />
      )}

      {showBulkPunchModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Preencher Presença em Lote</h3>
            <p className="text-sm text-slate-500 mb-4">Selecione o intervalo de datas para preencher o ponto de todos os funcionários ativos.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Data Inicial</label>
                <input type="date" value={bulkDates.start} onChange={(e) => setBulkDates({ ...bulkDates, start: e.target.value })} className="w-full px-3 py-2 border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Data Final</label>
                <input type="date" value={bulkDates.end} onChange={(e) => setBulkDates({ ...bulkDates, end: e.target.value })} className="w-full px-3 py-2 border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowBulkPunchModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 font-medium">Cancelar</button>
              <button onClick={async () => {
                if (!window.confirm('Tem certeza que deseja preencher as presenças?')) return;
                try {
                  const start = new Date(bulkDates.start + 'T00:00:00');
                  const end = new Date(bulkDates.end + 'T00:00:00');
                  const activeEmployees = employees.filter(e => e.status === 'Ativo');
                  let count = 0;
                  
                  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const currentDate = d.toISOString().split('T')[0];
                    for (const emp of activeEmployees) {
                      const computedValue = calculateDailyValue(emp, currentDate);
                      await addTimePunch({
                        employee_id: emp.id,
                        date: currentDate,
                        entry_time: '07:00',
                        exit_time: '17:00',
                        hours_worked: 9,
                        value_paid: computedValue,
                        note: 'Presença Automática'
                      });
                      count++;
                    }
                  }
                  alert(`${count} presenças registradas com sucesso!`);
                  setShowBulkPunchModal(false);
                } catch (error: any) {
                  alert('Erro ao registrar presenças: ' + error.message);
                }
              }} className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 font-medium">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
