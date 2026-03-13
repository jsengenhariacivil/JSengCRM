
import React, { useState } from 'react';
import { Plus, FileText, Sun, CloudRain, Calendar, Search, Building, MoreVertical, Edit, Trash2, Camera, Image as ImageIcon, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { DailyReport } from '../types';
import { supabase } from '../supabaseClient';

const DailyReportsPage: React.FC = () => {
    const { projects, dailyReports, addDailyReport, updateDailyReport, deleteDailyReport } = useData();
    const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [newRDO, setNewRDO] = useState({
        date: new Date().toISOString().split('T')[0],
        weatherMorning: 'Ensolaorado' as any,
        weatherAfternoon: 'Ensolaorado' as any,
        laborTotal: 0,
        equipmentNotes: '',
        activitiesNotes: '',
        occurrencesNotes: '',
        photos: [] as string[]
    });

    const [isUploading, setIsUploading] = useState(false);

    const filteredReports = dailyReports.filter(report => {
        const matchesProject = selectedProjectId ? report.projectId === selectedProjectId : true;
        const project = projects.find(p => p.id === report.projectId);
        const matchesSearch = project?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.activitiesNotes.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesProject && matchesSearch;
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId || !newRDO.activitiesNotes) return;

        if (editingReport) {
            await updateDailyReport({
                ...editingReport,
                ...newRDO,
                projectId: selectedProjectId
            });
        } else {
            await addDailyReport({
                ...newRDO,
                id: Date.now().toString(),
                projectId: selectedProjectId,
                createdAt: new Date().toISOString()
            });
        }

        setIsFormOpen(false);
        setEditingReport(null);
        setNewRDO({
            date: new Date().toISOString().split('T')[0],
            weatherMorning: 'Ensolaorado' as any,
            weatherAfternoon: 'Ensolaorado' as any,
            laborTotal: 0,
            equipmentNotes: '',
            activitiesNotes: '',
            occurrencesNotes: '',
            photos: []
        });
    };

    const handleEdit = (report: DailyReport) => {
        setEditingReport(report);
        setSelectedProjectId(report.projectId);
        setNewRDO({
            date: report.date,
            weatherMorning: report.weatherMorning,
            weatherAfternoon: report.weatherAfternoon,
            laborTotal: report.laborTotal,
            equipmentNotes: report.equipmentNotes || '',
            activitiesNotes: report.activitiesNotes,
            occurrencesNotes: report.occurrencesNotes || '',
            photos: report.photos || []
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este diário de obra?')) {
            await deleteDailyReport(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#181418]">Diário de Obra (RDO)</h1>
                    <p className="text-slate-500">Registro diário de atividades, clima e efetivo</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm"
                >
                    <Plus size={18} />
                    <span>Novo RDO</span>
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por obra ou atividade..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#c79229] outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#c79229] outline-none appearance-none"
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                        <option value="">Todas as Obras</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* RDO List */}
            <div className="space-y-4">
                {filteredReports.length > 0 ? (
                    filteredReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(report => {
                        const project = projects.find(p => p.id === report.projectId);
                        return (
                            <div key={report.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-[#c79229]/30 transition-all">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-[#c79229] uppercase tracking-wider">{project?.title || 'Obra Desconhecida'}</span>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-sm font-medium text-slate-500">{new Date(report.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">Relatório Diário</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-4 text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-1">
                                                <Sun size={16} className={report.weatherMorning === 'Ensolaorado' ? 'text-yellow-500' : 'text-slate-300'} />
                                                <span className="text-slate-600">M: {report.weatherMorning}</span>
                                            </div>
                                            <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
                                                <CloudRain size={16} className={report.weatherAfternoon === 'Chuva' ? 'text-blue-500' : 'text-slate-300'} />
                                                <span className="text-slate-600">T: {report.weatherAfternoon}</span>
                                            </div>
                                            <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
                                                <span className="font-bold text-[#c79229]">{report.laborTotal}</span>
                                                <span className="text-slate-600">Pessoas</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => handleEdit(report)}
                                                className="p-2 text-slate-400 hover:text-[#c79229] hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Editar RDO"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(report.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Excluir RDO"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Atividades do Dia</h4>
                                    <p className="text-slate-700 whitespace-pre-wrap mb-4">{report.activitiesNotes}</p>
                                    
                                    {report.photos && report.photos.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {report.photos.map((url, i) => (
                                                <img key={i} src={url} className="w-20 h-20 rounded-lg object-cover border border-slate-200" alt="" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Nenhum diário de obra encontrado</p>
                        <p className="text-sm">Selecione uma obra ou mude sua busca.</p>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingReport ? 'Editar Diário de Obra' : 'Lançar Diário de Obra (RDO)'}
                            </h2>
                            <button 
                                onClick={() => {
                                    setIsFormOpen(false);
                                    setEditingReport(null);
                                }} 
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Selecione a Obra</label>
                                    <select
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                    >
                                        <option value="">Escolha uma obra...</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Data</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={newRDO.date}
                                        onChange={e => setNewRDO({ ...newRDO, date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Efetivo de Pessoal</label>
                                    <input
                                        type="number"
                                        placeholder="Qtd de pessoas em campo"
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={newRDO.laborTotal || ''}
                                        onChange={e => setNewRDO({ ...newRDO, laborTotal: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Clima (Manhã)</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={newRDO.weatherMorning}
                                        onChange={e => setNewRDO({ ...newRDO, weatherMorning: e.target.value as any })}
                                    >
                                        <option value="Ensolaorado">☀️ Ensolaorado</option>
                                        <option value="Nublado">☁️ Nublado</option>
                                        <option value="Instável">🌦️ Instável</option>
                                        <option value="Chuva">🌧️ Chuva</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Clima (Tarde)</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={newRDO.weatherAfternoon}
                                        onChange={e => setNewRDO({ ...newRDO, weatherAfternoon: e.target.value as any })}
                                    >
                                        <option value="Ensolaorado">☀️ Ensolaorado</option>
                                        <option value="Nublado">☁️ Nublado</option>
                                        <option value="Instável">🌦️ Instável</option>
                                        <option value="Chuva">🌧️ Chuva</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Atividades e Ocorrências</label>
                                    <textarea
                                        required
                                        rows={5}
                                        placeholder="Descreva as atividades executadas, equipamentos utilizados, materiais recebidos e eventuais imprevistos..."
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none resize-none"
                                        value={newRDO.activitiesNotes}
                                        onChange={e => setNewRDO({ ...newRDO, activitiesNotes: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Fotos do Dia</label>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
                                        {newRDO.photos.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                                                <img src={url} className="w-full h-full object-cover" alt="" />
                                                <button
                                                    type="button"
                                                    onClick={() => setNewRDO(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full shadow-sm"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className={`flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-[#c79229] hover:bg-amber-50 cursor-pointer transition-all ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                                            <Camera size={20} className="text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-400 mt-1">{isUploading ? '...' : 'Adicionar'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                className="hidden"
                                                disabled={isUploading}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file || !selectedProjectId) return;
                                                    
                                                    setIsUploading(true);
                                                    try {
                                                        const fileExt = file.name.split('.').pop();
                                                        const fileName = `rdo_${Date.now()}.${fileExt}`;
                                                        const filePath = `${selectedProjectId}/${fileName}`;

                                                        const { error: uploadError } = await supabase.storage
                                                            .from('project-photos')
                                                            .upload(filePath, file);

                                                        if (uploadError) throw uploadError;

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('project-photos')
                                                            .getPublicUrl(filePath);

                                                        setNewRDO(prev => ({ ...prev, photos: [...prev.photos, publicUrl] }));
                                                    } catch (err: any) {
                                                        alert('Erro no upload: ' + err.message);
                                                    } finally {
                                                        setIsUploading(false);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-[#c79229] text-[#181418] font-black rounded-xl hover:bg-[#a67922] transition-colors shadow-lg shadow-amber-900/10"
                                >
                                    Salvar Relatório
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyReportsPage;
