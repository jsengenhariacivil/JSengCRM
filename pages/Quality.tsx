import React, { useState } from 'react';
import { Plus, Search, ClipboardCheck, Calendar, User, Building, Trash2, Edit2, CheckCircle, Clock, X, Save, AlertCircle, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { QualityInspection, Status } from '../types';

const Quality: React.FC = () => {
    const { qualityInspections, addQualityInspection, updateQualityInspection, deleteQualityInspection, projects } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInspection, setEditingInspection] = useState<QualityInspection | null>(null);

    const [formData, setFormData] = useState<Partial<QualityInspection>>({
        projectId: '',
        title: '',
        description: '',
        status: 'Pendente',
        inspector: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const filteredInspections = qualityInspections.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.inspector.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (inspection?: QualityInspection) => {
        if (inspection) {
            setEditingInspection(inspection);
            setFormData(inspection);
        } else {
            setEditingInspection(null);
            setFormData({
                projectId: '',
                title: '',
                description: '',
                status: 'Pendente',
                inspector: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingInspection) {
                await updateQualityInspection({ ...editingInspection, ...formData } as QualityInspection);
            } else {
                await addQualityInspection(formData as QualityInspection);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Erro ao salvar inspeção:', error);
            alert('Erro ao salvar inspeção de qualidade. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Conforme':
                return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">Conforme</span>;
            case 'Pendente':
                return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase">Pendente</span>;
            case 'Não Conforme':
                return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase">Não Conforme</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">{status}</span>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardCheck className="text-[#c79229]" />
                        Módulo de Qualidade
                    </h1>
                    <p className="text-slate-500 text-sm">Inspeções, conformidades e checklists técnicos</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    <span>Nova Inspeção</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por título ou inspetor..."
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
                                <th className="px-6 py-4">Inspeção</th>
                                <th className="px-6 py-4">Obra</th>
                                <th className="px-6 py-4">Inspetor</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Resultado</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredInspections.map((q) => (
                                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 text-slate-400 rounded-lg group-hover:bg-[#c79229]/10 group-hover:text-[#c79229] transition-all">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-bold text-slate-700">{q.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{projects.find(p => p.id === q.projectId)?.title || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-600 italic">{q.inspector}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{new Date(q.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{getStatusBadge(q.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(q)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                            <button onClick={() => deleteQualityInspection(q.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredInspections.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/20 font-medium">
                                        Nenhuma inspeção de qualidade registrada.
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">{editingInspection ? 'Editar Inspeção' : 'Nova Inspeção de Qualidade'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Título da Inspeção</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.title}
                                        placeholder="Ex: Inspeção de Armadura - Laje de Piso"
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Obra</label>
                                    <select
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.projectId}
                                        onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                    >
                                        <option value="">Selecione a obra...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Resultado da Inspeção</label>
                                    <select
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none font-bold"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="Pendente">⏳ Aguardando Inspeção</option>
                                        <option value="Conforme">✅ Conforme (Aprovado)</option>
                                        <option value="Não Conforme">❌ Não Conforme (Reprovado)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Engenheiro / Inspetor</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.inspector}
                                        onChange={e => setFormData({ ...formData, inspector: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none font-mono"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição do Item Inspecionado</label>
                                    <textarea
                                        rows={2}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notas e Observações de Não Conformidade</label>
                                    <textarea
                                        rows={3}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none resize-none"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-2.5 bg-[#c79229] text-[#181418] rounded-xl font-black shadow-lg shadow-[#c79229]/40 hover:bg-[#a67922] transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
                                    {isSaving ? 'Salvando...' : 'Salvar Inspeção'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quality;
