
import React, { useState } from 'react';
import { Calendar, Plus, Clock, Users, CheckCircle2, AlertCircle, Building, Search, Save, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ProjectTask, ProjectMilestone } from '../types';

const PlanningPage: React.FC = () => {
    const {
        projects,
        projectTasks, addProjectTask, deleteProjectTask, updateProjectTask,
        projectMilestones, addProjectMilestone, deleteProjectMilestone, updateProjectMilestone
    } = useData();

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

    // Form States
    const [newTask, setNewTask] = useState({ title: '', startDate: '', endDate: '', progress: 0 });
    const [newMilestone, setNewMilestone] = useState({ title: '', date: '', isCompleted: false });

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const tasks = projectTasks.filter(t => t.projectId === selectedProjectId);
    const milestones = projectMilestones.filter(m => m.projectId === selectedProjectId);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId || !newTask.title) return;

        await addProjectTask({
            ...newTask,
            id: Date.now().toString(),
            projectId: selectedProjectId
        });

        setIsTaskModalOpen(false);
        setNewTask({ title: '', startDate: '', endDate: '', progress: 0 });
    };

    const handleAddMilestone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId || !newMilestone.title) return;

        await addProjectMilestone({
            ...newMilestone,
            id: Date.now().toString(),
            projectId: selectedProjectId
        });

        setIsMilestoneModalOpen(false);
        setNewMilestone({ title: '', date: '', isCompleted: false });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#181418]">Planejamento de Obras</h1>
                    <p className="text-slate-500">Gestão de cronogramas, etapas e prazos de conclusão</p>
                </div>
            </div>

            {/* Project Selector */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <Building className="text-[#c79229] hidden md:block" size={24} />
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Selecione a Obra para Planejar</label>
                    <select
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c79229] outline-none text-lg font-bold text-slate-800 appearance-none bg-slate-50"
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                        <option value="">Escolha uma obra em andamento...</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>
                {selectedProject && (
                    <div className="flex items-center gap-6 px-6 py-2 bg-slate-50 border-x border-slate-100 hidden lg:flex">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Progresso</p>
                            <p className="text-xl font-black text-[#c79229]">{selectedProject.progress}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Budget</p>
                            <p className="text-xl font-black text-slate-800">R$ {(selectedProject.budget / 1000).toFixed(0)}k</p>
                        </div>
                    </div>
                )}
            </div>

            {!selectedProjectId ? (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                    <Calendar size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="text-xl font-medium">Selecione uma obra acima para abrir o planejamento</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Cronograma / Tarefas */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Clock size={18} className="text-[#c79229]" /> Cronograma de Etapas
                                </h2>
                                <button
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="p-1 px-3 text-xs font-bold bg-[#c79229] text-[#181418] rounded hover:bg-[#a67922] transition-colors"
                                >
                                    Adicionar Etapa
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {tasks.length > 0 ? (
                                    tasks.map(task => (
                                        <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{task.title}</h3>
                                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(task.startDate).toLocaleDateString('pt-BR')}</span>
                                                        <span>—</span>
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(task.endDate).toLocaleDateString('pt-BR')}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteProjectTask(task.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#c79229] rounded-full"
                                                        style={{ width: `${task.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-black text-[#c79229] w-10 text-right">{task.progress}%</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center text-slate-400 italic">Nenhuma etapa cadastrada no cronograma.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Marcos e Entregas */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-green-500" /> Marcos de Obra
                                </h2>
                                <button
                                    onClick={() => setIsMilestoneModalOpen(true)}
                                    className="p-1 px-3 text-xs font-bold bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                >
                                    Novo Marco
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                {milestones.length > 0 ? (
                                    milestones.map(m => (
                                        <div key={m.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateProjectMilestone({ ...m, isCompleted: !m.isCompleted })}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${m.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200 text-transparent hover:border-green-500'}`}
                                                >
                                                    <CheckCircle2 size={14} />
                                                </button>
                                                <div>
                                                    <p className={`text-sm font-bold ${m.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{m.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase">{new Date(m.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteProjectMilestone(m.id)}
                                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all font-bold"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-slate-400 text-xs italic">Nenhum marco estratégico cadastrado.</div>
                                )}
                            </div>
                        </div>

                        {/* Resumo de Prazo */}
                        {selectedProject && (
                            <div className="bg-[#181418] text-white p-6 rounded-xl shadow-lg border-l-4 border-[#c79229]">
                                <h3 className="text-xs font-bold text-[#c79229] uppercase tracking-tighter mb-4">Meta de Finalização</h3>
                                <div className="flex items-end gap-2 mb-2">
                                    <Clock className="text-[#c79229] mb-1" size={20} />
                                    <span className="text-2xl font-black">{Math.ceil((new Date(selectedProject.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}</span>
                                    <span className="text-slate-400 font-bold pb-1 underline decoration-[#c79229]">dias restantes</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Previsão: {new Date(selectedProject.endDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* Task Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Nova Etapa do Cronograma</h2>
                            <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-2xl">×</button>
                        </div>
                        <form onSubmit={handleAddTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Título da Etapa</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Execução de Alvenaria"
                                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Data Início</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={newTask.startDate}
                                        onChange={e => setNewTask({ ...newTask, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Data Fim</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={newTask.endDate}
                                        onChange={e => setNewTask({ ...newTask, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-[#c79229] text-[#181418] font-black rounded-xl hover:bg-[#a67922] transition-colors"
                            >
                                Salvar Etapa
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Milestone Modal */}
            {isMilestoneModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Novo Marco Estratégico</h2>
                            <button onClick={() => setIsMilestoneModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-2xl">×</button>
                        </div>
                        <form onSubmit={handleAddMilestone} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Título do Marco</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Laje Concluída"
                                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                                    value={newMilestone.title}
                                    onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Data Prevista</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                                    value={newMilestone.date}
                                    onChange={e => setNewMilestone({ ...newMilestone, date: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-green-500 text-white font-black rounded-xl hover:bg-green-600 transition-colors"
                            >
                                Salvar Marco
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PlanningPage;
