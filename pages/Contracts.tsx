import React, { useState } from 'react';
import { Plus, Search, FileText, Calendar, DollarSign, User, MoreVertical, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Contract, Status } from '../types';

const Contracts: React.FC = () => {
    const { contracts, addContract, updateContract, deleteContract, clients, proposals } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Contract>>({
        title: '',
        clientId: '',
        proposalId: '',
        value: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Rascunho',
        terms: ''
    });

    const filteredContracts = contracts.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (contract?: Contract) => {
        if (contract) {
            setEditingContract(contract);
            setFormData(contract);
        } else {
            setEditingContract(null);
            setFormData({
                title: '',
                clientId: '',
                proposalId: '',
                value: 0,
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                status: 'Rascunho',
                terms: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const client = clients.find(c => c.id === formData.clientId);
        const clientName = client?.name || '';

        if (editingContract) {
            await updateContract({ ...editingContract, ...formData, clientName } as Contract);
        } else {
            await addContract({ ...formData, clientName } as Contract);
        }
        setIsModalOpen(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Ativo':
            case 'Assinado':
            case 'Finalizado':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={12} /> {status}</span>;
            case 'Rascunho':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock size={12} /> Rascunho</span>;
            case 'Cancelado':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1"><AlertCircle size={12} /> Cancelado</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gestão de Contratos</h1>
                    <p className="text-slate-500 text-sm">Contratos comerciais e parcerias</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    <span>Novo Contrato</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por título ou cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Contrato</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Vigência</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredContracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#c79229]/10 rounded-lg text-[#c79229]">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-bold text-slate-700">{contract.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{contract.clientName}</td>
                                    <td className="px-6 py-4 font-bold text-slate-700">R$ {contract.value.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <div className="flex flex-col">
                                            <span>Início: {new Date(contract.startDate).toLocaleDateString()}</span>
                                            {contract.endDate && <span className="text-xs text-slate-400">Fim: {new Date(contract.endDate).toLocaleDateString()}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(contract.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(contract)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Excluir contrato permanentemente?')) deleteContract(contract.id);
                                                }}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredContracts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/20">
                                        Nenhum contrato encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">{editingContract ? 'Editar Contrato' : 'Novo Contrato'}</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Título do Contrato</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cliente</label>
                                    <select
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                                        value={formData.clientId}
                                        onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Proposta Relacionada</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                                        value={formData.proposalId}
                                        onChange={e => {
                                            const prop = proposals.find(p => p.id === e.target.value);
                                            setFormData({
                                                ...formData,
                                                proposalId: e.target.value,
                                                value: prop ? prop.total : formData.value
                                            });
                                        }}
                                    >
                                        <option value="">Nenhuma proposta</option>
                                        {proposals.map(p => <option key={p.id} value={p.id}>{p.clientName} - R$ {p.total.toLocaleString()}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Valor (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none transition-all font-bold text-[#c79229]"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                                    <select
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="Rascunho">Rascunho</option>
                                        <option value="Assinado">Assinado</option>
                                        <option value="Ativo">Ativo</option>
                                        <option value="Finalizado">Finalizado</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data de Início</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data de Término</label>
                                    <input
                                        type="date"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none transition-all"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Termos e Observações</label>
                                    <textarea
                                        rows={4}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none transition-all resize-none"
                                        value={formData.terms}
                                        onChange={e => setFormData({ ...formData, terms: e.target.value })}
                                        placeholder="Detalhes do contrato, cláusulas específicas..."
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-[#c79229] text-[#181418] rounded-xl font-black shadow-lg shadow-[#c79229]/20 hover:bg-[#a67922] transition-all transform active:scale-95"
                                >
                                    {editingContract ? 'Atualizar Contrato' : 'Criar Contrato'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contracts;
