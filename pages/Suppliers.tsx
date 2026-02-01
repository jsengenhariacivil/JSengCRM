
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
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.document.includes(searchTerm)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-[#c79229]/30 transition-colors relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#c79229]">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[#181418]">{supplier.name}</h3>
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{supplier.category}</span>
                </div>
              </div>

              {/* Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={(e) => toggleMenu(supplier.id, e)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50"
                >
                  <MoreVertical size={20} />
                </button>

                {openMenuId === supplier.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-10 py-1">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600 mb-4">
              <div className="flex items-center">
                <Mail size={16} className="mr-3 text-slate-400" />
                <span className="truncate">{supplier.email}</span>
              </div>
              <div className="flex items-center">
                <Phone size={16} className="mr-3 text-slate-400" />
                {supplier.phone}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-mono text-slate-400">CNPJ: {supplier.document}</span>
            </div>
          </div>
        ))}
        {filteredSuppliers.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500">
            Nenhum fornecedor encontrado.
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-[#181418]">
                {editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input
                  type="text"
                  list="categories"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                  placeholder="Ex: Materiais Básicos"
                />
                <datalist id="categories">
                  <option value="Materiais Básicos" />
                  <option value="Elétrica e Hidráulica" />
                  <option value="Maquinário" />
                  <option value="Acabamentos" />
                  <option value="Serviços" />
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                />
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

              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c79229] text-[#181418] hover:bg-[#a67922] rounded-lg font-bold shadow-sm flex items-center gap-2"
                >
                  <Save size={18} />
                  <span>{editingId ? 'Salvar Alterações' : 'Salvar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
