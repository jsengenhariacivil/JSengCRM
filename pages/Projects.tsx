import React, { useState } from 'react';
import { Plus, MapPin, Calendar, DollarSign, Clock, X, Save, Building, User, Ruler, FileText, Sun, Cloud, CloudRain, CloudLightning, Image as ImageIcon, Trash2, LineChart as LineChartIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Status, Project } from '../types';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface ProjectCardProps {
  project: Project;
  onDetails: (p: Project) => void;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDetails, onEdit, onDelete }) => {
  const { currentUser } = useAuth();

  const getStatusColor = (s: string) => {
    switch (s) {
      case Status.IN_PROGRESS: return 'bg-[#c79229]/20 text-[#c79229]';
      case Status.COMPLETED: return 'bg-green-100 text-green-700';
      case Status.PENDING: return 'bg-slate-200 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-5 flex flex-col h-full hover:border-[#c79229]/30">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2 ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          <h3 className="text-lg font-bold text-[#181418]">{project.title}</h3>
          <p className="text-sm text-slate-500">{project.clientName}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
          <span className="font-bold text-xs">{project.progress}%</span>
        </div>
      </div>

      <div className="space-y-3 mb-6 flex-1">
        <div className="flex items-center text-sm text-slate-600">
          <MapPin size={16} className="mr-2 text-[#c79229]" />
          <span className="truncate">{project.address}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <Calendar size={16} className="mr-2 text-[#c79229]" />
          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <DollarSign size={16} className="mr-2 text-[#c79229]" />
          Orçamento: R$ {project.budget.toLocaleString()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
        <div
          className="bg-[#c79229] h-2 rounded-full transition-all duration-500"
          style={{ width: `${project.progress}%` }}
        ></div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onDetails(project)}
          className="flex-1 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200"
        >
          Detalhes
        </button>
        <button
          onClick={() => onEdit(project)}
          className="flex-1 py-2 text-sm font-medium text-[#181418] bg-[#c79229] hover:bg-[#a67922] rounded-lg font-bold"
        >
          Gerenciar
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="py-2 px-3 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100"
          title="Excluir Obra"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject, clients, financials } = useData();
  const { currentUser } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'measurements' | 'rdo' | 'cronograma' | 'curva_s'>('info');
  const { measurements, addMeasurement, dailyReports, addDailyReport, projectTasks, addProjectTask, deleteProjectTask, projectMilestones, addProjectMilestone, deleteProjectMilestone, updateProjectMilestone } = useData();

  // State para novas medições
  const [newMeasure, setNewMeasure] = useState({ description: '', percentage: 0, date: new Date().toISOString().split('T')[0] });

  // State para novo RDO
  const [newRDO, setNewRDO] = useState({
    date: new Date().toISOString().split('T')[0],
    weatherMorning: 'Ensolaorado' as any,
    weatherAfternoon: 'Ensolaorado' as any,
    laborTotal: 0,
    equipmentNotes: '',
    activitiesNotes: '',
    occurrencesNotes: ''
  });

  // State para novas Tarefas e Marcos (Etapa 2)
  const [newTask, setNewTask] = useState({ title: '', startDate: '', endDate: '', progress: 0 });
  const [newMilestone, setNewMilestone] = useState({ title: '', date: '', isCompleted: false });

  // Form State
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    clientId: '',
    clientName: '',
    address: '',
    status: Status.PENDING,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    budget: 0,
    progress: 0
  });

  const handleOpenNew = () => {
    setSelectedProject(null);
    setFormData({
      title: '',
      clientId: '',
      clientName: '',
      address: '',
      status: Status.PENDING,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      budget: 0,
      progress: 0
    });
    setIsFormOpen(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      ...project,
      startDate: project.startDate?.split('T')[0] || '', // Ensure format for date input
      endDate: project.endDate?.split('T')[0] || ''
    });
    setIsFormOpen(true);
  };

  const handleDetails = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('info');
    setIsDetailsOpen(true);
  };

  const generateSCurveData = (project: Project) => {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const today = new Date();
    const totalDays = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 3600 * 24));

    const points = 10;
    const data = [];

    const projectExpenses = financials
      .filter(f => f.projectId === project.id && f.type === 'Despesa')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let accumulatedExpense = 0;

    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const currentDate = new Date(start.getTime() + t * totalDays * 1000 * 3600 * 24);

      // Matemática: Smoothstep approach (Curva em "S" natural)
      const plannedProgress = Math.min(100, Math.max(0, (t * t * (3 - 2 * t)) * 100));
      const plannedBudget = (project.budget * plannedProgress) / 100;

      accumulatedExpense = projectExpenses
        .filter(f => new Date(f.date) <= currentDate)
        .reduce((sum, f) => sum + f.amount, 0);

      let actualProgress = null;
      let actualExpense = null;

      if (currentDate <= today || i === 0) {
        const daysPassed = Math.max(0, (currentDate.getTime() - start.getTime()) / (1000 * 3600 * 24));
        const daysToToday = Math.max(1, (today.getTime() - start.getTime()) / (1000 * 3600 * 24));

        // Se a obra já passou da data de fim e temos progresso
        if (today > end && i === points) {
          actualProgress = project.progress;
          actualExpense = accumulatedExpense;
        } else {
          const actualT = Math.min(1, daysPassed / daysToToday);
          actualProgress = project.progress * actualT;
          actualExpense = accumulatedExpense;
        }
      }

      data.push({
        name: currentDate.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' }),
        'Físico Planejado (%)': Number(plannedProgress.toFixed(1)),
        'Físico Realizado (%)': actualProgress !== null ? Number(actualProgress.toFixed(1)) : null,
        'Custo Planejado (R$)': Number(plannedBudget.toFixed(2)),
        'Custo Realizado (R$)': actualExpense !== null ? Number(actualExpense.toFixed(2)) : null,
      });
    }
    return data;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.clientId) return;

    // VALIDATION: Prevent saving as 'Completed' if progress is not 100%
    if (formData.status === Status.COMPLETED && (formData.progress || 0) < 100) {
      alert("Atenção: A obra só pode ser marcada como 'Concluída' quando o progresso estiver em 100%.");
      return;
    }

    // Find client name from Global Context
    const client = clients.find(c => c.id === formData.clientId);
    const clientName = client ? client.name : formData.clientName || 'Cliente Desconhecido';

    if (selectedProject) {
      // Edit Mode
      await updateProject({
        ...selectedProject,
        ...formData as Project,
        clientName
      });
    } else {
      // Create Mode
      const newProject: Project = {
        ...formData as Project,
        id: (Date.now()).toString(),
        clientName
      };
      await addProject(newProject);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181418]">Obras e Projetos</h1>
          <p className="text-slate-500">Acompanhamento de execução e custos</p>
        </div>
        {currentUser?.permissions.editProjects && (
          <button
            onClick={handleOpenNew}
            className="flex items-center space-x-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm"
          >
            <Plus size={18} />
            <span>Nova Obra</span>
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#c79229] text-[#181418] p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Clock size={24} className="opacity-80" />
            <div>
              <p className="text-[#181418]/70 text-sm font-bold">Em Andamento</p>
              <p className="text-2xl font-bold">{projects.filter(p => p.status === Status.IN_PROGRESS).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <DollarSign size={24} className="text-green-600" />
            <div>
              <p className="text-slate-500 text-sm">Budget Total Ativo</p>
              <p className="text-2xl font-bold text-[#181418]">R$ {projects.reduce((acc, curr) => acc + curr.budget, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onDetails={handleDetails}
            onEdit={handleEdit}
            onDelete={async (id) => {
              if (window.confirm('Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.')) {
                await deleteProject(id);
              }
            }}
          />
        ))}

        {/* Add New Placeholder Card */}
        <button
          onClick={handleOpenNew}
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-[#c79229] hover:text-[#c79229] transition-colors h-full min-h-[300px]"
        >
          <Plus size={48} className="mb-2" />
          <span className="font-medium">Criar Novo Projeto</span>
        </button>
      </div>

      {/* CREATE / EDIT MODAL */}
      {
        isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-bold text-[#181418]">
                  {selectedProject ? 'Gerenciar Obra' : 'Nova Obra'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título da Obra</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                      placeholder="Ex: Residencial Flores"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                    <select
                      required
                      value={formData.clientId}
                      onChange={(e) => {
                        const selectedClientId = e.target.value;
                        const selectedClient = clients.find(c => c.id === selectedClientId);
                        setFormData({
                          ...formData,
                          clientId: selectedClientId,
                          clientName: selectedClient?.name || '',
                          // Auto-fill address se for nova obra e o cliente tiver endereço
                          address: (!selectedProject && selectedClient?.address) ? selectedClient.address : formData.address
                        });
                      }}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                    >
                      <option value="">Selecione...</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                    >
                      <option value={Status.PENDING}>{Status.PENDING}</option>
                      <option value={Status.IN_PROGRESS}>{Status.IN_PROGRESS}</option>
                      <option value={Status.COMPLETED}>{Status.COMPLETED}</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Endereço da Obra</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                      placeholder="Rua, Número, Bairro, Cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Término (Previsto)</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Orçamento (R$)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Progresso (%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => {
                          const newProgress = parseInt(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            progress: newProgress,
                            status: newProgress === 100 ? Status.COMPLETED : (prev.status === Status.COMPLETED ? Status.IN_PROGRESS : prev.status)
                          }));
                        }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#c79229]"
                      />
                      <span className={`text-sm font-bold w-12 text-right ${formData.progress === 100 ? 'text-green-600' : 'text-[#c79229]'}`}>{formData.progress}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#c79229] text-[#181418] hover:bg-[#a67922] rounded-lg font-bold shadow-sm flex items-center gap-2"
                  >
                    <Save size={18} />
                    <span>Salvar Obra</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* DETAILS MODAL */}
      {isDetailsOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-[#181418]">{selectedProject.title}</h3>
                <p className="text-sm text-slate-500">{selectedProject.clientName}</p>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-100 px-6 bg-white overflow-x-auto">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'info' ? 'border-[#c79229] text-[#c79229]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Informações
              </button>
              <button
                onClick={() => setActiveTab('curva_s')}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'curva_s' ? 'border-[#c79229] text-[#c79229]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Curva S
              </button>
              <button
                onClick={() => setActiveTab('measurements')}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'measurements' ? 'border-[#c79229] text-[#c79229]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Medições
              </button>
              <button
                onClick={() => setActiveTab('rdo')}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'rdo' ? 'border-[#c79229] text-[#c79229]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                RDO
              </button>
              <button
                onClick={() => setActiveTab('cronograma')}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'cronograma' ? 'border-[#c79229] text-[#c79229]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Cronograma
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="text-[#c79229] mt-1" size={20} />
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Cliente</p>
                          <p className="font-medium text-[#181418]">{selectedProject.clientName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="text-[#c79229] mt-1" size={20} />
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Endereço</p>
                          <p className="font-medium text-[#181418]">{selectedProject.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="text-[#c79229] mt-1" size={20} />
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Período</p>
                          <p className="font-medium text-[#181418]">
                            {new Date(selectedProject.startDate).toLocaleDateString()} — {new Date(selectedProject.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DollarSign className="text-[#c79229] mt-1" size={20} />
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Investimento</p>
                          <p className="font-medium text-[#181418]">R$ {selectedProject.budget.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-700">Progresso Geral</span>
                      <span className="text-sm font-black text-[#c79229]">{selectedProject.progress}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3 border border-slate-200">
                      <div className="bg-[#c79229] h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(199,146,41,0.3)]" style={{ width: `${selectedProject.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'curva_s' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 text-center mb-2">
                    A Curva S compara o avanço <strong className="text-[#c79229]">Físico (%)</strong> e <strong className="text-blue-600">Financeiro (R$)</strong> planejado contra o realizado.
                  </p>

                  <div className="h-64 w-full bg-slate-50 border border-slate-100 rounded-lg p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={generateSCurveData(selectedProject)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                        <RechartsTooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Area yAxisId="left" type="monotone" dataKey="Físico Planejado (%)" fill="#c79229" stroke="none" fillOpacity={0.1} />
                        <Line yAxisId="left" type="monotone" dataKey="Físico Planejado (%)" stroke="#c79229" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Line yAxisId="left" type="monotone" dataKey="Físico Realizado (%)" stroke="#c79229" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />

                        <Line yAxisId="right" type="monotone" dataKey="Custo Planejado (R$)" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Line yAxisId="right" type="monotone" dataKey="Custo Realizado (R$)" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === 'measurements' && (
                <div className="space-y-6">
                  {/* Novo Lançamento de Medição */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-[#181418] mb-4 flex items-center gap-2">
                      <Plus size={16} className="text-[#c79229]" /> Novo Lançamento de Medição
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Descrição (ex: Alvenaria 1º Pavimento)"
                          className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#c79229] outline-none"
                          value={newMeasure.description}
                          onChange={e => setNewMeasure({ ...newMeasure, description: e.target.value })}
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="%"
                          className="w-full border border-slate-300 rounded-lg p-2 pr-6 text-sm focus:ring-1 focus:ring-[#c79229] outline-none"
                          value={newMeasure.percentage || ''}
                          onChange={e => setNewMeasure({ ...newMeasure, percentage: parseFloat(e.target.value) })}
                        />
                        <span className="absolute right-3 top-2 text-slate-400 text-sm">%</span>
                      </div>
                      <button
                        onClick={async () => {
                          if (!newMeasure.description || !newMeasure.percentage) return;
                          const value = (selectedProject.budget * newMeasure.percentage) / 100;
                          await addMeasurement({
                            ...newMeasure,
                            id: Date.now().toString(),
                            projectId: selectedProject.id,
                            value,
                            status: Status.PAID
                          });
                          setNewMeasure({ description: '', percentage: 0, date: new Date().toISOString().split('T')[0] });
                        }}
                        className="bg-[#c79229] text-[#181418] font-bold rounded-lg py-2 hover:bg-[#a67922] shadow-sm text-sm"
                      >
                        Lançar Medição
                      </button>
                    </div>
                  </div>

                  {/* Histórico de Medições */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Histórico de Execução</h4>
                    <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="px-4 py-3">Descrição</th>
                            <th className="px-4 py-3">Data</th>
                            <th className="px-4 py-3 text-center">% Obra</th>
                            <th className="px-4 py-3 text-right">Valor (R$)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {measurements.filter(m => m.projectId === selectedProject.id).length > 0 ? (
                            measurements.filter(m => m.projectId === selectedProject.id).map(m => (
                              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-[#181418]">{m.description}</td>
                                <td className="px-4 py-3 text-slate-500">{new Date(m.date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="bg-[#c79229]/10 text-[#c79229] px-2 py-0.5 rounded-full font-bold">+{m.percentage}%</span>
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-green-600">R$ {m.value.toLocaleString()}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">Nenhuma medição realizada nesta obra.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rdo' && (
                <div className="space-y-6">
                  {/* Formulário RDO Simplificado */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-[#181418] mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-[#c79229]" /> Novo Diário de Obra (RDO)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Clima (Manhã)</label>
                            <select
                              className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none"
                              value={newRDO.weatherMorning}
                              onChange={e => setNewRDO({ ...newRDO, weatherMorning: e.target.value as any })}
                            >
                              <option value="Ensolaorado">☀️ Sol</option>
                              <option value="Chuva">🌧️ Chuva</option>
                              <option value="Nublado">☁️ Nublado</option>
                              <option value="Instável">🌦️ Instável</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Clima (Tarde)</label>
                            <select
                              className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none"
                              value={newRDO.weatherAfternoon}
                              onChange={e => setNewRDO({ ...newRDO, weatherAfternoon: e.target.value as any })}
                            >
                              <option value="Ensolaorado">☀️ Sol</option>
                              <option value="Chuva">🌧️ Chuva</option>
                              <option value="Nublado">☁️ Nublado</option>
                              <option value="Instável">🌦️ Instável</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Efetivo de Pessoal</label>
                          <input
                            type="number"
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none"
                            placeholder="Fretistas, Serventes, etc."
                            value={newRDO.laborTotal || ''}
                            onChange={e => setNewRDO({ ...newRDO, laborTotal: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Atividades Executadas</label>
                          <textarea
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none h-24 resize-none"
                            placeholder="Descreva o que foi feito hoje..."
                            value={newRDO.activitiesNotes}
                            onChange={e => setNewRDO({ ...newRDO, activitiesNotes: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={async () => {
                          if (!newRDO.activitiesNotes) return;
                          await addDailyReport({
                            ...newRDO,
                            id: Date.now().toString(),
                            projectId: selectedProject.id,
                            createdAt: new Date().toISOString()
                          });
                          setNewRDO({
                            date: new Date().toISOString().split('T')[0],
                            weatherMorning: 'Ensolaorado' as any,
                            weatherAfternoon: 'Ensolaorado' as any,
                            laborTotal: 0,
                            equipmentNotes: '',
                            activitiesNotes: '',
                            occurrencesNotes: ''
                          });
                        }}
                        className="bg-[#c79229] text-[#181418] font-bold rounded-lg px-6 py-2 hover:bg-[#a67922] shadow-sm text-sm"
                      >
                        Salvar RDO
                      </button>
                    </div>
                  </div>

                  {/* Listagem de RDOs */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Últimos Relatórios</h4>
                    {dailyReports.filter(r => r.projectId === selectedProject.id).length > 0 ? (
                      dailyReports.filter(r => r.projectId === selectedProject.id).map(r => (
                        <div key={r.id} className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm hover:border-[#c79229]/30 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-slate-100 px-3 py-1 rounded text-xs font-bold text-slate-600">
                                {new Date(r.date + 'T12:00:00').toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-400">
                                {r.weatherMorning === 'Ensolaorado' ? <Sun size={14} className="text-yellow-500" /> : <CloudRain size={14} className="text-blue-400" />}
                                {r.weatherAfternoon === 'Ensolaorado' ? <Sun size={14} className="text-yellow-500" /> : <CloudRain size={14} className="text-blue-400" />}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase">Efetivo: {r.laborTotal}</span>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.activitiesNotes}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400 italic">Nenhum diário de obra registrado.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'cronograma' && (
                <div className="space-y-8">
                  {/* Cronograma / Gantt Simplificado */}
                  <section>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-[#181418]">Cronograma de Obra</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nova Tarefa..."
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          className="text-sm border border-slate-200 rounded px-2 py-1"
                        />
                        <input
                          type="date"
                          value={newTask.startDate}
                          onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                          className="text-sm border border-slate-200 rounded px-2 py-1"
                        />
                        <input
                          type="date"
                          value={newTask.endDate}
                          onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                          className="text-sm border border-slate-200 rounded px-2 py-1"
                        />
                        <button
                          onClick={() => {
                            if (newTask.title && newTask.startDate && newTask.endDate) {
                              addProjectTask({ ...newTask, id: (Date.now()).toString(), projectId: selectedProject.id });
                              setNewTask({ title: '', startDate: '', endDate: '', progress: 100 });
                            }
                          }}
                          className="bg-[#c79229] text-[#181418] px-3 py-1 rounded text-xs font-bold"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 overflow-x-auto">
                      <div className="min-w-[600px] space-y-4">
                        {projectTasks.filter(t => t.projectId === selectedProject.id).length === 0 ? (
                          <p className="text-center text-slate-400 py-8 italic">Sem tarefas cadastradas.</p>
                        ) : (
                          projectTasks.filter(t => t.projectId === selectedProject.id).map(task => (
                            <div key={task.id} className="relative">
                              <div className="flex justify-between text-xs text-slate-500 mb-1 px-1">
                                <span>{task.title}</span>
                                <div className="flex gap-2">
                                  <span>{new Date(task.startDate + 'T12:00:00').toLocaleDateString()} - {new Date(task.endDate + 'T12:00:00').toLocaleDateString()}</span>
                                  <button onClick={() => deleteProjectTask(task.id)} className="text-red-400 hover:text-red-600">×</button>
                                </div>
                              </div>
                              <div className="h-6 bg-slate-200 rounded-full overflow-hidden flex items-center">
                                <div
                                  className="h-full bg-[#c79229] flex items-center justify-end px-2 text-[10px] font-bold text-white transition-all"
                                  style={{ width: `${task.progress || 100}%` }}
                                >
                                  {task.progress || 100}%
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Marcos de Obra (Milestones) */}
                  <section>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-[#181418]">Marcos Críticos (Milestones)</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ex: Entrega de Chaves"
                          value={newMilestone.title}
                          onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                          className="text-sm border border-slate-200 rounded px-2 py-1"
                        />
                        <input
                          type="date"
                          value={newMilestone.date}
                          onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                          className="text-sm border border-slate-200 rounded px-2 py-1"
                        />
                        <button
                          onClick={() => {
                            if (newMilestone.title && newMilestone.date) {
                              addProjectMilestone({ ...newMilestone, id: (Date.now()).toString(), projectId: selectedProject.id });
                              setNewMilestone({ title: '', date: '', isCompleted: false });
                            }
                          }}
                          className="bg-[#181418] text-white px-3 py-1 rounded text-xs font-bold"
                        >
                          + Milestone
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectMilestones.filter(m => m.projectId === selectedProject.id).length === 0 ? (
                        <div className="col-span-2 text-center text-slate-400 py-4 italic">Sem marcos cadastrados.</div>
                      ) : (
                        projectMilestones.filter(m => m.projectId === selectedProject.id).map(m => (
                          <div key={m.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={m.isCompleted}
                                onChange={() => updateProjectMilestone({ ...m, isCompleted: !m.isCompleted })}
                                className="w-4 h-4 accent-[#c79229]"
                              />
                              <div>
                                <p className={`text-sm font-bold ${m.isCompleted ? 'text-slate-400 line-through' : 'text-[#181418]'}`}>{m.title}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">{new Date(m.date + 'T12:00:00').toLocaleDateString()}</p>
                              </div>
                            </div>
                            <button onClick={() => deleteProjectMilestone(m.id)} className="p-1 text-slate-300 hover:text-red-500">
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-bold transition-all"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default Projects;
