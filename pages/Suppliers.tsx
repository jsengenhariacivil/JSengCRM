
import React, { useState } from 'react';
import { Search, MoreVertical, Mail, Phone, MapPin, Truck, Plus, Filter, Edit, Trash2, X, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Supplier } from '../types';

const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de controle da interface
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado do formulário
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    document: '',
    email: '',
    phone: '',
    category: ''
  });

  const filteredSuppliers = suppliers.filter(s =>
    (s.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (s.document || '').includes(searchTerm || '')
  );

  // --- HANDLERS ---

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      document: '',
      email: '',
      phone: '',
      category: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setFormData({ ...supplier });
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este fornecedor?')) {
      await deleteSupplier(id);
    }
    setOpenMenuId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingId) {
        await updateSupplier({ ...formData, id: editingId } as Supplier);
      } else {
        const newSupplier: Supplier = {
          ...formData as Supplier,
          id: (Date.now()).toString()
        };
        await addSupplier(newSupplier);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert('Erro ao salvar fornecedor: ' + error.message);
    }
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="space-y-6" onClick={() => setOpenMenuId(null)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181418]">Fornecedores</h1>
          <p className="text-slate-500">Gestão de parceiros e fornecimento</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center space-x-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Novo Fornecedor</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input
          type="text"
          placeholder="Buscar fornecedor por nome ou CNPJ..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#c79229] outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" onClick={() => setOpenMenuId(null)}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map(supplier => (
                <tr key={supplier.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#c79229]">
                        <Truck size={18} />
                      </div>
                      <span className="font-medium text-[#181418]">{supplier.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{supplier.category}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    <div>{supplier.phone}</div>
                    <div className="text-xs">{supplier.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-slate-400">CNPJ: {supplier.document}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-2 text-slate-400 hover:text-[#c79229] hover:bg-[#c79229]/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
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
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            Nenhum fornecedor encontrado.
          </div>
        )}
      </div>

      {/* PAINEL LATERAL (RIGHT DRAWER) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white shadow-2xl h-screen flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-[#181418]">
                  {editingId ? 'Editar' : 'Novo'} Fornecedor
                </h3>
                <p className="text-xs text-slate-500">Gerencie as informações do fornecedor</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome/Razão Social</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                    placeholder="Ex: Materiais, Serviços, Equipamentos..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone/WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ/Documento</label>
                  <input
                    type="text"
                    required
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                  />
                </div>
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
                <span>SALVAR FORNECEDOR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
