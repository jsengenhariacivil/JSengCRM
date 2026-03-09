import React, { useState } from 'react';
import { Plus, Search, ShoppingCart, Calendar, DollarSign, User, Package, Trash2, Edit2, CheckCircle, Clock, X, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { PurchaseOrder, PurchaseOrderItem, Status } from '../types';

const Purchases: React.FC = () => {
    const { purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, suppliers, projects } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
        supplierId: '',
        projectId: '',
        description: '',
        totalValue: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        items: []
    });

    const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
        description: '',
        quantity: 1,
        unit: 'un',
        unitPrice: 0,
        totalPrice: 0
    });

    const filteredPOs = purchaseOrders.filter(po =>
        po.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (po?: PurchaseOrder) => {
        if (po) {
            setEditingPO(po);
            setFormData(po);
        } else {
            setEditingPO(null);
            setFormData({
                supplierId: '',
                projectId: '',
                description: '',
                totalValue: 0,
                date: new Date().toISOString().split('T')[0],
                status: 'Pendente',
                items: []
            });
        }
        setIsModalOpen(true);
    };

    const handleAddItem = () => {
        if (!newItem.description || !newItem.quantity || !newItem.unitPrice) return;
        const item: PurchaseOrderItem = {
            id: Date.now().toString(),
            purchaseOrderId: editingPO?.id || '',
            description: newItem.description,
            quantity: newItem.quantity,
            unit: newItem.unit || 'un',
            unitPrice: newItem.unitPrice,
            totalPrice: (newItem.quantity || 0) * (newItem.unitPrice || 0)
        };
        const updatedItems = [...(formData.items || []), item];
        const total = updatedItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
        setFormData({ ...formData, items: updatedItems, totalValue: total });
        setNewItem({ description: '', quantity: 1, unit: 'un', unitPrice: 0, totalPrice: 0 });
    };

    const handleRemoveItem = (id: string) => {
        const updatedItems = (formData.items || []).filter(i => i.id !== id);
        const total = updatedItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
        setFormData({ ...formData, items: updatedItems, totalValue: total });
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingPO) {
                await updatePurchaseOrder({ ...editingPO, ...formData } as PurchaseOrder);
            } else {
                await addPurchaseOrder(formData as PurchaseOrder);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Erro ao salvar pedido de compra:', error);
            alert('Erro ao salvar pedido de compra. Verifique os dados e tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Aprovado':
            case 'Entregue':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={12} /> {status === 'Entregue' ? 'Recebido' : 'Aprovado'}</span>;
            case 'Pendente':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock size={12} /> Em Aberto</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Setor de Compras</h1>
                    <p className="text-slate-500 text-sm">Gestão de pedidos e suprimentos</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    <span>Nova Compra</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Pedido</th>
                                <th className="px-6 py-4">Fornecedor</th>
                                <th className="px-6 py-4">Obra</th>
                                <th className="px-6 py-4">Valor Total</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredPOs.map((po) => (
                                <tr key={po.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-700">{po.description}</td>
                                    <td className="px-6 py-4 text-slate-600">{suppliers.find(s => s.id === po.supplierId)?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-600">{projects.find(p => p.id === po.projectId)?.title || 'N/A'}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">R$ {po.totalValue.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(po.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{getStatusBadge(po.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(po)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                            <button onClick={() => deletePurchaseOrder(po.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPOs.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/20">
                                        Nenhuma ordem de compra encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-8 border border-slate-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800 truncate flex items-center gap-2">
                                <ShoppingCart className="text-[#c79229]" />
                                {editingPO ? 'Editar Pedido de Compra' : 'Novo Pedido de Compra'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição do Pedido</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Ex: Compra de Cimento e Ferragens"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                                    <select
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="Pendente">Em Aberto</option>
                                        <option value="Aprovado">Aprovado</option>
                                        <option value="Enviado">Enviado</option>
                                        <option value="Entregue">Recebido</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Fornecedor</label>
                                    <select
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.supplierId}
                                        onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Obra Vinculada</label>
                                    <select
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.projectId}
                                        onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data do Pedido</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                <div className="bg-slate-50 p-4 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2 uppercase text-xs tracking-wider">
                                        <Package size={16} className="text-[#c79229]" />
                                        Itens da Compra
                                    </h3>
                                </div>
                                <div className="p-4 space-y-4 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                                        <div className="md:col-span-5">
                                            <label className="text-[10px] uppercase font-bold text-slate-400">Produto/Serviço</label>
                                            <input
                                                type="text"
                                                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                                                value={newItem.description}
                                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] uppercase font-bold text-slate-400">Qtd</label>
                                            <input
                                                type="number"
                                                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                                                value={newItem.quantity}
                                                onChange={e => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-400">Und</label>
                                            <input
                                                type="text"
                                                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                                                value={newItem.unit}
                                                onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="text-[10px] uppercase font-bold text-slate-400">Preço Unit.</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-[#c79229]"
                                                value={newItem.unitPrice}
                                                onChange={e => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <button
                                                type="button"
                                                onClick={handleAddItem}
                                                className="w-full h-9 bg-slate-800 text-white rounded-lg flex items-center justify-center hover:bg-slate-700 font-bold"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 divide-y divide-slate-100">
                                        {(formData.items || []).map(item => (
                                            <div key={item.id} className="py-3 flex justify-between items-center group">
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-700">{item.description}</p>
                                                    <p className="text-xs text-slate-500">{item.quantity} {item.unit} x R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="font-black text-slate-800">R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(formData.items || []).length === 0 && (
                                            <p className="py-8 text-center text-slate-400 text-sm italic">Nenhum item adicionado ainda.</p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[#c79229]">
                                        <span className="font-bold uppercase text-xs">Total do Pedido</span>
                                        <span className="text-2xl font-black">R$ {formData.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-2.5 bg-[#c79229] text-[#181418] rounded-xl font-black shadow-lg shadow-[#c79229]/20 hover:bg-[#a67922] transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
                                    {isSaving ? 'Salvando...' : (editingPO ? 'Atualizar Pedido' : 'Finalizar Pedido')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
