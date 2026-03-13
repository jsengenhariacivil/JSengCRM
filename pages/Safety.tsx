import React, { useState } from 'react';
import { Plus, Search, ShieldAlert, Calendar, User, Building, Trash2, Edit2, CheckCircle, Clock, X, Save, AlertTriangle, Info, CheckSquare } from 'lucide-react';
import { useData } from '../context/DataContext';
import { SafetyRecord, Status } from '../types';

const Safety: React.FC = () => {
    const { safetyRecords, addSafetyRecord, updateSafetyRecord, deleteSafetyRecord, projects, teamMembers } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<SafetyRecord | null>(null);

    const [formData, setFormData] = useState<Partial<SafetyRecord>>({
        type: 'Treinamento',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        responsible: '',
        status: 'Pendente',
        projectId: ''
    });

    const filteredRecords = safetyRecords.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.responsible.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (record?: SafetyRecord) => {
        if (record) {
            setEditingRecord(record);
            setFormData(record);
        } else {
            // Tentar encontrar um responsável padrão (TST ou Engenheiro de Segurança)
            const defaultResp = teamMembers.find(m =>
                m.role.toLowerCase().includes('tst') ||
                m.role.toLowerCase().includes('segurança')
            )?.name || '';

            setEditingRecord(null);
            setFormData({
                type: 'Treinamento',
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                responsible: defaultResp,
                status: 'Pendente',
                projectId: ''
            });
        }
        setIsModalOpen(true);
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingRecord) {
                await updateSafetyRecord({ ...editingRecord, ...formData } as SafetyRecord);
            } else {
                await addSafetyRecord(formData as SafetyRecord);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Erro ao salvar registro de segurança:', error);
            alert(`Erro ao salvar registro de segurança: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Acidente': return <AlertTriangle className="text-red-500" size={18} />;
            case 'Treinamento': return <CheckSquare className="text-blue-500" size={18} />;
            case 'Inspeção': return <ShieldAlert className="text-[#c79229]" size={18} />;
            default: return <Info className="text-slate-400" size={18} />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Concluído':
                return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">Concluído</span>;
            case 'Pendente':
                return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase">Pendente</span>;
            case 'Alerta':
                return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase">Alerta</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">{status}</span>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldAlert className="text-[#c79229]" />
                        SST
                    </h1>
                    <p className="text-slate-500 text-sm">Saúde e Segurança do Trabalho</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    <span>Novo Registro</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar registros..."
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
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Título</th>
                                <th className="px-6 py-4">Obra</th>
                                <th className="px-6 py-4">Responsável</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(record.type)}
                                            <span className="font-medium text-slate-600 uppercase text-[10px] tracking-tight">{record.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700">{record.title}</td>
                                    <td className="px-6 py-4 text-slate-600">{projects.find(p => p.id === record.projectId)?.title || 'Geral/Empresa'}</td>
                                    <td className="px-6 py-4 text-slate-600 italic">{record.responsible}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => deleteSafetyRecord(record.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/20">
                                        Nenhum registro de segurança encontrado.
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
                            <h2 className="text-xl font-bold text-slate-800">{editingRecord ? 'Editar Registro SST' : 'Novo Registro SST'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Título / Assunto</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo de Registro</label>
                                    <select
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none font-bold"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="Treinamento">📄 Treinamento (DDS)</option>
                                        <option value="Inspeção">🔍 Inspeção de Campo</option>
                                        <option value="EPI">🦺 Entrega de EPI</option>
                                        <option value="Incidente">⚠️ Incidente</option>
                                        <option value="Acidente">🚨 Acidente</option>
                                        <option value="Outros">⚙️ Outros</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Obra Vinculada</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.projectId}
                                        onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                    >
                                        <option value="">Geral / Escritório</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
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

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Responsável / Emitente</label>
                                    <div className="relative">
                                        <input
                                            list="team-members-list"
                                            type="text"
                                            required
                                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                            value={formData.responsible}
                                            placeholder="Selecione ou digite o nome"
                                            onChange={e => setFormData({ ...formData, responsible: e.target.value })}
                                        />
                                        <datalist id="team-members-list">
                                            {teamMembers.map(m => (
                                                <option key={m.id} value={m.name}>
                                                    {m.role}
                                                </option>
                                            ))}
                                        </datalist>
                                        <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Situação / Status</label>
                                    <div className="flex gap-2">
                                        {['Pendente', 'Alerta', 'Concluído'].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, status: s as any })}
                                                className={`flex-1 py-2 rounded-lg border font-bold text-xs transition-all ${formData.status === s ? 'bg-[#c79229] border-[#c79229] text-[#181418]' : 'bg-white border-slate-200 text-slate-400'}`}
                                            >
                                                {s.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição / Observações</label>
                                    <textarea
                                        rows={4}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detalhes técnicos, recomendações, ações corretivas..."
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-2.5 bg-[#c79229] text-[#181418] rounded-xl font-black shadow-lg shadow-[#c79229]/40 hover:bg-[#a67922] transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
                                    {isSaving ? 'Salvando...' : (editingRecord ? 'Atualizar Registro' : 'Salvar Registro')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Safety;
