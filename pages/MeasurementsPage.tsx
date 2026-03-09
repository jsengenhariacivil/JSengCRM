
import React, { useState } from 'react';
import { Plus, BarChart3, TrendingUp, DollarSign, Calendar, Search, Building, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Status, Measurement } from '../types';

const MeasurementsPage: React.FC = () => {
    const { projects, measurements, addMeasurement } = useData();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [newMeasure, setNewMeasure] = useState({
        description: '',
        percentage: 0,
        date: new Date().toISOString().split('T')[0]
    });

    const filteredMeasurements = measurements.filter(m => {
        const matchesProject = selectedProjectId ? m.projectId === selectedProjectId : true;
        const project = projects.find(p => p.id === m.projectId);
        const matchesSearch = project?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesProject && matchesSearch;
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project || !newMeasure.description || !newMeasure.percentage) return;

        const value = (project.budget * newMeasure.percentage) / 100;

        await addMeasurement({
            ...newMeasure,
            id: Date.now().toString(),
            projectId: selectedProjectId,
            value,
            status: Status.PAID
        });

        setIsFormOpen(false);
        setNewMeasure({ description: '', percentage: 0, date: new Date().toISOString().split('T')[0] });
    };

    const getTotalMeasured = (projectId: string) => {
        return measurements
            .filter(m => m.projectId === projectId)
            .reduce((acc, curr) => acc + curr.percentage, 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#181418]">Medição de Obras</h1>
                    <p className="text-slate-500">Acompanhamento de evolução física e financeira</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm"
                >
                    <Plus size={18} />
                    <span>Lançar Medição</span>
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Total Medido (Geral)</p>
                        <p className="text-xl font-black text-slate-800">R$ {measurements.reduce((acc, m) => acc + m.value, 0).toLocaleString('pt-BR')}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Medições Realizadas</p>
                        <p className="text-xl font-black text-slate-800">{measurements.length}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por obra ou etapa..."
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

            {/* Measurements Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Obra / Descrição</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Evolução (%)</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Valor Bruto</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredMeasurements.length > 0 ? (
                            filteredMeasurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(m => {
                                const project = projects.find(p => p.id === m.projectId);
                                return (
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-xs font-bold text-[#c79229] uppercase mb-0.5">{project?.title || 'Obra'}</p>
                                                <p className="text-sm font-medium text-slate-800">{m.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(m.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c79229]/10 text-[#c79229]">
                                                +{m.percentage}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-black text-slate-800">R$ {m.value.toLocaleString('pt-BR')}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">
                                                    <CheckCircle2 size={12} className="mr-1" /> Pago/Liquidado
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                    Nenhuma medição encontrada com os filtros atuais.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">Lançar Nova Medição</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Selecione a Obra</label>
                                <select
                                    required
                                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none"
                                    value={selectedProjectId}
                                    onChange={(e) => {
                                        setSelectedProjectId(e.target.value);
                                    }}
                                >
                                    <option value="">Escolha uma obra...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                                {selectedProjectId && (
                                    <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                                        <TrendingUp size={12} />
                                        <span>Progresso Atual: <strong>{getTotalMeasured(selectedProjectId)}%</strong></span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Descrição do Serviço</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Chapisco e Reboque Externo"
                                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none"
                                    value={newMeasure.description}
                                    onChange={e => setNewMeasure({ ...newMeasure, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Evolução (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max={100 - getTotalMeasured(selectedProjectId)}
                                            step="0.1"
                                            placeholder="Ex: 5"
                                            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none pr-10"
                                            value={newMeasure.percentage || ''}
                                            onChange={e => setNewMeasure({ ...newMeasure, percentage: parseFloat(e.target.value) })}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Data</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={newMeasure.date}
                                        onChange={e => setNewMeasure({ ...newMeasure, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            {selectedProjectId && newMeasure.percentage > 0 && (
                                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <DollarSign size={16} className="text-green-600" />
                                        <span className="text-sm font-bold text-green-800">Valor da Medição</span>
                                    </div>
                                    <p className="text-2xl font-black text-green-600">
                                        R$ {((projects.find(p => p.id === selectedProjectId)?.budget || 0) * (newMeasure.percentage / 100)).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
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
                                    Confirmar Medição
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeasurementsPage;
