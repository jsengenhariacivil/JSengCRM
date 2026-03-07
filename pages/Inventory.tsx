
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
    Truck
} from 'lucide-react';

const Inventory: React.FC = () => {
    const { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todas');

    const categories = ['Todas', 'Materiais', 'Ferramentas', 'Equipamentos', 'EPIs', 'Consumíveis'];

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
                    <button className="flex items-center gap-2 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg transition-colors shadow-sm">
                        <History size={20} />
                        Histórico
                    </button>
                    <button className="flex items-center gap-2 bg-[#c79229] hover:bg-[#b08124] text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
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
                    <div className="text-2xl font-bold text-slate-800">124</div>
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
        </div>
    );
};

export default Inventory;
