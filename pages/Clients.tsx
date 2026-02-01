
import React, { useState } from 'react';
import { Search, MoreVertical, Mail, Phone, MapPin, UserPlus, X, Save, Trash2, Edit, Briefcase, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Client } from '../types';

const Clients: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, projects, proposals } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // State for Modals & Menus
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form Data State
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    type: 'Pessoa Física'
  });

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm)
  );

  // --- Handlers ---

  const handleOpenNew = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      document: '',
      email: '',
      phone: '',
      address: '',
      type: 'Pessoa Física'
    });
    setIsFormOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setEditingClient(client);
    setFormData(client);
    setOpenMenuId(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteClient(id);
    }
    setOpenMenuId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.document) return;

    if (editingClient) {
      await updateClient({ ...editingClient, ...formData } as Client);
    } else {
      const newClient = {
        ...formData as Client,
        id: (Date.now()).toString() // ID simples baseado em timestamp
      };
      await addClient(newClient);
    }
    setIsFormOpen(false);
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Get History Data from Context
  const getClientHistory = (clientId: string) => {
    const clientProjects = projects.filter(p => p.clientId === clientId);
    const clientProposals = proposals.filter(p => p.clientId === clientId);
    return { projects: clientProjects, proposals: clientProposals };
  };

  return (
    <div className="space-y-6" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181418]">Clientes & Cadastros</h1>
          <p className="text-slate-500">Gerencie sua base de contatos</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center space-x-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm transition-colors"
        >
          <UserPlus size={18} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome ou CPF/CNPJ..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#c79229] outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6 hover:border-[#c79229]/30 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-[#181418] flex items-center justify-center text-[#c79229] font-bold text-lg">
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-[#181418]">{client.name}</h3>
                  <p className="text-xs text-slate-500">{client.type}</p>
                </div>
              </div>

              {/* Dropdown Menu */}
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => toggleMenu(client.id)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <MoreVertical size={20} />
                </button>

                {openMenuId === client.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-10 py-1">
                    <button
                      onClick={(e) => handleEdit(e, client)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, client.id)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center">
                <Mail size={16} className="mr-3 text-[#c79229]" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center">
                <Phone size={16} className="mr-3 text-[#c79229]" />
                {client.phone}
              </div>
              <div className="flex items-center">
                <MapPin size={16} className="mr-3 text-[#c79229]" />
                <span className="truncate">{client.address}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400">{client.document}</span>
              <button
                onClick={() => setHistoryClient(client)}
                className="text-[#c79229] text-sm font-bold hover:underline"
              >
                Ver Histórico
              </button>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setIsFormOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-[#181418]">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                  >
                    <option value="Pessoa Física">Pessoa Física</option>
                    <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF/CNPJ</label>
                  <input
                    type="text"
                    required
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c79229] text-[#181418] hover:bg-[#a67922] rounded-lg font-bold shadow-sm flex items-center gap-2"
                >
                  <Save size={18} />
                  <span>Salvar Cliente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {historyClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setHistoryClient(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50 flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-[#181418]">{historyClient.name}</h3>
                <p className="text-sm text-slate-500 mt-1">Histórico de Relacionamento</p>
              </div>
              <button onClick={() => setHistoryClient(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Projects Section */}
              <div className="mb-8">
                <h4 className="flex items-center gap-2 font-bold text-[#181418] mb-4">
                  <Briefcase size={20} className="text-[#c79229]" />
                  Obras e Projetos
                </h4>
                {getClientHistory(historyClient.id).projects.length > 0 ? (
                  <div className="space-y-3">
                    {getClientHistory(historyClient.id).projects.map(p => (
                      <div key={p.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{p.title}</p>
                          <p className="text-xs text-slate-500">{new Date(p.startDate).toLocaleDateString()} - {p.status}</p>
                        </div>
                        <span className="font-medium text-slate-700">R$ {p.budget.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">Nenhuma obra registrada.</p>
                )}
              </div>

              {/* Proposals Section */}
              <div>
                <h4 className="flex items-center gap-2 font-bold text-[#181418] mb-4">
                  <FileText size={20} className="text-[#c79229]" />
                  Propostas Comerciais
                </h4>
                {getClientHistory(historyClient.id).proposals.length > 0 ? (
                  <div className="space-y-3">
                    {getClientHistory(historyClient.id).proposals.map(p => (
                      <div key={p.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">Proposta #{p.id.padStart(4, '0')}</p>
                          <p className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString()} - {p.status}</p>
                        </div>
                        <span className="font-medium text-slate-700">R$ {p.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">Nenhuma proposta registrada.</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end flex-shrink-0">
              <button
                onClick={() => setHistoryClient(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
