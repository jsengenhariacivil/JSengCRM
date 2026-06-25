
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { InventoryItem, Status } from '../types';
import {
    Package,
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownLeft,
    Settings,
    History,
    Briefcase,
    HardHat,
    Truck,
    X,
    Save
} from 'lucide-react';

const Inventory: React.FC = () => {
    const { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, inventoryMovements } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todas');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
        name: '',
        category: 'Materiais',
        unit: 'UN',
        quantity: 0,
        minQuantity: 0,
        unitPrice: 0,
        status: 'Em Estoque',
        location: ''
    });

    const categories = ['Todas', 'Materiais', 'Ferramentas', 'Equipamentos', 'EPIs', 'Consumíveis'];

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();

        // Sanitização e Validação básica
        const sanitizedItem: InventoryItem = {
            id: '', // Supabase gera
            name: newItem.name || 'Item sem nome',
            category: newItem.category || 'Materiais',
            unit: newItem.unit || 'UN',
            quantity: Number(newItem.quantity) || 0,
            minQuantity: Number(newItem.minQuantity) || 0,
            unitPrice: Number(newItem.unitPrice) || 0,
            status: newItem.status || 'Em Estoque',
            location: newItem.location || '',
            supplierId: newItem.supplierId || undefined
        };

        try {
            await addInventoryItem(sanitizedItem);
            setIsAddModalOpen(false);
            setNewItem({
                name: '',
                category: 'Materiais',
                unit: 'UN',
                quantity: 0,
                minQuantity: 0,
                unitPrice: 0,
                status: 'Em Estoque',
                location: ''
            });
        } catch (error: any) {
            console.error('Erro ao adicionar item no frontend:', error);
            alert(`Erro ao cadastrar item: ${error.message || 'Verifique os dados e tente novamente.'}`);
        }
    };

    const filteredItems = inventoryItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'Todas' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minQuantity);

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Package className="text-[#c79229]" />
                        Inventário & Almoxarifado
                    </h1>
                    <p className="text-slate-500">Controle centralizado de materiais, ferramentas e patrimônio.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="flex items-center gap-2 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <History size={20} />
                        Histórico
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-[#c79229] hover:bg-[#b08124] text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Novo Item
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Total de Itens</span>
                        <Package size={18} className="text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{inventoryItems.length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Estoque Baixo</span>
                        <AlertTriangle size={18} className="text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{lowStockItems.length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Valor em Estoque</span>
                        <Package size={18} className="text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                        R$ {inventoryItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0).toLocaleString('pt-BR')}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Movimentações (Mês)</span>
                        <ArrowUpRight size={18} className="text-[#c79229]" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                        {inventoryMovements.filter(m => {
                            const d = new Date(m.date);
                            const now = new Date();
                            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                        }).length}
                    </div>
                </div>
            </div>

            {lowStockItems.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                    <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                    <div>
                        <h4 className="font-bold text-red-800">Alerta de Estoque Crítico</h4>
                        <p className="text-sm text-red-700">
                            Existem {lowStockItems.length} itens com quantidade abaixo do mínimo recomendado.
                            Gere uma lista de compras para reposição.
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar item pelo nome, código ou localização..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c79229]/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors
                  ${categoryFilter === cat
                                        ? 'bg-[#c79229] text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-4">Item / Categoria</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Quantidade</th>
                            <th className="px-6 py-4">Unidade</th>
                            <th className="px-6 py-4">Preço Médio</th>
                            <th className="px-6 py-4">Localização</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredItems.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                            {item.category === 'Materiais' && <Truck size={20} />}
                                            {item.category === 'Ferramentas' && <Briefcase size={20} />}
                                            {item.category === 'Equipamentos' && <Settings size={20} />}
                                            {item.category === 'EPIs' && <HardHat size={20} />}
                                            {!['Materiais', 'Ferramentas', 'Equipamentos', 'EPIs'].includes(item.category) && <Package size={20} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{item.name}</div>
                                            <div className="text-xs text-slate-400">{item.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                    ${item.status === 'Em Estoque' ? 'bg-green-100 text-green-700' :
                                            item.status === 'Baixo Estoque' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-700'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold ${item.quantity <= item.minQuantity ? 'text-red-600' : 'text-slate-800'}`}>
                                            {item.quantity}
                                        </span>
                                        {item.quantity <= item.minQuantity && (
                                            <AlertTriangle size={14} className="text-red-500" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{item.unit}</td>
                                <td className="px-6 py-4 font-medium text-slate-700">
                                    R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4 text-slate-500">{item.location || '--'}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                                            title="Entrada de Estoque"
                                        >
                                            <ArrowDownLeft size={20} />
                                        </button>
                                        <button
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                            title="Saída de Estoque"
                                        >
                                            <ArrowUpRight size={20} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ADD ITEM MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-[#181418] p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#c79229] rounded-lg text-[#181418]">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Cadastrar Novo Item</h2>
                                    <p className="text-white/60 text-xs">Adicione materiais ou ferramentas ao estoque</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddItem} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Item</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#c79229]/20 outline-none"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        placeholder="Ex: Cimento CP-II 50kg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#c79229]/20 outline-none"
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        {categories.filter(c => c !== 'Todas').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#c79229]/20 outline-none"
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                    >
                                        <option value="UN">Unidade (UN)</option>
                                        <option value="KG">Quilo (KG)</option>
                                        <option value="M">Metro (M)</option>
                                        <option value="M2">Metro Quadrado (M²)</option>
                                        <option value="M3">Metro Cúbico (M³)</option>
                                        <option value="L">Litro (L)</option>
                                        <option value="PCT">Pacote (PCT)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade Inicial</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#c79229]/20 outline-none"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. Mínima (Alerta)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#c79229]/20 outline-none"
                                        value={newItem.minQuantity}
                                        onChange={(e) => setNewItem({ ...newItem, minQuantity: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Preço Unitário (R$)</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        min="0"
                                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#c79229]/20 outline-none"
                                        value={newItem.unitPrice}
                                        onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#c79229]/20 outline-none"
                                        value={newItem.location}
                                        onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                                        placeholder="Ex: Almoxarifado Central - Prateleira A"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-[#c79229] text-[#181418] font-bold px-8 py-2.5 rounded-lg hover:bg-[#b08124] transition-colors shadow-lg shadow-[#c79229]/20"
                                >
                                    <Save size={20} />
                                    Salvar Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <History size={20} className="text-[#c79229]" />
                                Histórico de Movimentações
                            </h3>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                            {inventoryMovements.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">Nenhuma movimentação registrada.</p>
                            ) : (
                                <table className="w-full text-left text-sm text-slate-700">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-medium text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Data</th>
                                            <th className="px-4 py-3">Tipo</th>
                                            <th className="px-4 py-3">Item</th>
                                            <th className="px-4 py-3">Qtd</th>
                                            <th className="px-4 py-3">Responsável</th>
                                            <th className="px-4 py-3">Motivo / Obs</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {inventoryMovements.map(m => {
                                            const item = inventoryItems.find(i => i.id === m.itemId);
                                            return (
                                                <tr key={m.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3">{new Date(m.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${m.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {m.type === 'IN' ? 'Entrada' : 'Saída'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">{item?.name || 'Item Removido'}</td>
                                                    <td className="px-4 py-3">{m.quantity} {item?.unit}</td>
                                                    <td className="px-4 py-3">{m.responsible || '---'}</td>
                                                    <td className="px-4 py-3 text-slate-500">{m.notes || '---'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button onClick={() => setIsHistoryModalOpen(false)} className="px-6 py-2.5 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-medium">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
