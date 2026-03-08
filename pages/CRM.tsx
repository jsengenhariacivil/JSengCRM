import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Lead } from '../types';
import {
    Users,
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Mail,
    Phone,
    Briefcase,
    TrendingUp,
    LayoutGrid,
    List as ListIcon,
    X,
    Trash2,
    DollarSign
} from 'lucide-react';

const CRM: React.FC = () => {
    const { leads, addLead, updateLead, deleteLead } = useData();
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const stages = [
        'Novo',
        'Contato Feito',
        'Proposta Enviada',
        'Negociação',
        'Convertido',
        'Perdido'
    ];

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getLeadsByStage = (stage: string) => {
        return filteredLeads.filter(lead => lead.status === stage);
    };

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        e.dataTransfer.setData('leadId', leadId);
    };

    const handleDrop = async (e: React.DragEvent, newStatus: any) => {
        const leadId = e.dataTransfer.getData('leadId');
        const lead = leads.find(l => l.id === leadId);
        if (lead && lead.status !== newStatus) {
            await updateLead({ ...lead, status: newStatus });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <>
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Users className="text-[#c79229]" />
                            CRM & Gestão de Leads
                        </h1>
                        <p className="text-slate-500">Acompanhe seu funil de vendas e oportunidades de negócio.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`p-2 rounded-md ${viewMode === 'kanban' ? 'bg-slate-100 text-[#c79229]' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-slate-100 text-[#c79229]' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <ListIcon size={20} />
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setSelectedLead(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-[#c79229] hover:bg-[#b08124] text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <Plus size={20} />
                            Novo Lead
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-500">Total de Leads</span>
                            <Users size={18} className="text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{leads.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-500">Em Negociação</span>
                            <TrendingUp size={18} className="text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                            {leads.filter(l => l.status === 'Negociação').length}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-500">Taxa de Conversão</span>
                            <TrendingUp size={18} className="text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                            {leads.length > 0
                                ? `${((leads.filter(l => l.status === 'Convertido').length / leads.length) * 100).toFixed(1)}%`
                                : '0%'}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-500">Valor Estimado</span>
                            <DollarSign size={18} className="text-[#c79229]" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                            R$ {leads.reduce((acc, curr) => acc + (curr.value || 0), 0).toLocaleString('pt-BR')}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, empresa ou e-mail..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c79229]/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 text-slate-600 hover:text-slate-800 px-4 py-2 border border-slate-200 rounded-lg">
                        <Filter size={20} />
                        Filtros
                    </button>
                </div>

                {viewMode === 'kanban' ? (
                    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
                        {stages.map(stage => (
                            <div
                                key={stage}
                                className="flex-shrink-0 w-80 bg-slate-50 rounded-xl p-3 flex flex-col"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage)}
                            >
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        {stage}
                                        <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                                            {getLeadsByStage(stage).length}
                                        </span>
                                    </h3>
                                    <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
                                </div>

                                <div className="flex-1 flex flex-col gap-3">
                                    {getLeadsByStage(stage).map(lead => (
                                        <div
                                            key={lead.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, lead.id)}
                                            onClick={() => {
                                                setSelectedLead(lead);
                                                setIsModalOpen(true);
                                            }}
                                            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-[#c79229] transition-colors group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800 group-hover:text-[#c79229] transition-colors">{lead.name}</h4>
                                            </div>
                                            {lead.company && (
                                                <div className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                                                    <Briefcase size={14} />
                                                    {lead.company}
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-2 mb-4">
                                                {lead.email && (
                                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {lead.email}
                                                    </div>
                                                )}
                                                {lead.phone && (
                                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Phone size={12} />
                                                        {lead.phone}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                <div className="text-sm font-bold text-slate-700">
                                                    {lead.value ? `R$ ${lead.value.toLocaleString('pt-BR')}` : '-'}
                                                </div>
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {lead.name.charAt(0)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-medium">
                                <tr>
                                    <th className="px-6 py-4">Nome / Empresa</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Valor Estimado</th>
                                    <th className="px-6 py-4">Origem</th>
                                    <th className="px-6 py-4">Criado em</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeads.map(lead => (
                                    <tr
                                        key={lead.id}
                                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                        onClick={() => {
                                            setSelectedLead(lead);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-slate-800">{lead.name}</div>
                                                <div className="text-xs text-slate-400">{lead.company || '--'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium 
                          ${lead.status === 'Convertido' ? 'bg-green-100 text-green-700' :
                                                    lead.status === 'Perdido' ? 'bg-red-100 text-red-700' :
                                                        lead.status === 'Negociação' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-slate-100 text-slate-700'}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {lead.value ? `R$ ${lead.value.toLocaleString('pt-BR')}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{lead.source}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-400 hover:text-slate-600">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Lead Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-slate-800">
                                {selectedLead ? 'Editar Lead' : 'Novo Lead'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedLead(null);
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const data = {
                                id: selectedLead?.id || '',
                                name: formData.get('name') as string,
                                company: formData.get('company') as string,
                                email: formData.get('email') as string,
                                phone: formData.get('phone') as string,
                                status: formData.get('status') as string,
                                source: formData.get('source') as string,
                                value: Number(formData.get('value')),
                                notes: formData.get('notes') as string,
                                createdAt: selectedLead?.createdAt || new Date().toISOString(),
                                lastContact: selectedLead?.lastContact || new Date().toISOString()
                            };

                            try {
                                if (selectedLead) {
                                    await updateLead(data as Lead);
                                } else {
                                    await addLead(data as Lead);
                                }
                                setIsModalOpen(false);
                                setSelectedLead(null);
                            } catch (err) {
                                console.error('Erro ao salvar lead:', err);
                                alert('Erro ao salvar lead.');
                            }
                        }} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nome Completo *</label>
                                    <input name="name" defaultValue={selectedLead?.name} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c79229]/20 outline-none" placeholder="Ex: João Silva" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Empresa</label>
                                    <input name="company" defaultValue={selectedLead?.company} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c79229]/20 outline-none" placeholder="Nome da empresa" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">E-mail</label>
                                    <input name="email" type="email" defaultValue={selectedLead?.email} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c79229]/20 outline-none" placeholder="email@exemplo.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">WhatsApp / Telefone</label>
                                    <input name="phone" defaultValue={selectedLead?.phone} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c79229]/20 outline-none" placeholder="(00) 00000-0000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Estágio do Funil</label>
                                    <select name="status" defaultValue={selectedLead?.status || 'Novo'} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c79229]/20 outline-none">
                                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Valor Estimado (R$)</label>
                                    <input name="value" type="number" step="0.01" defaultValue={selectedLead?.value} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c79229]/20 outline-none" placeholder="0,00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Origem</label>
                                    <input name="source" defaultValue={selectedLead?.source} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c79229]/20 outline-none" placeholder="Ex: Instagram, Indicação..." />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Observações / Notas</label>
                                <textarea name="notes" defaultValue={selectedLead?.notes} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c79229]/20 outline-none resize-none" placeholder="Detalhes da conversa..." />
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                {selectedLead && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (window.confirm('Excluir este lead?')) {
                                                await deleteLead(selectedLead.id);
                                                setIsModalOpen(false);
                                                setSelectedLead(null);
                                            }
                                        }}
                                        className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium px-4 py-2"
                                    >
                                        <Trash2 size={20} />
                                        Excluir
                                    </button>
                                )}
                                <div className="flex gap-3 ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setSelectedLead(null);
                                        }}
                                        className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-2 bg-[#c79229] hover:bg-[#b08124] text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
                                    >
                                        {selectedLead ? 'Salvar Alterações' : 'Criar Lead'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CRM;
