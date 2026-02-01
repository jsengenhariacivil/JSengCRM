
import React, { useState } from 'react';
import { Plus, MapPin, Calendar, DollarSign, Clock, X, Save, Building, User } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Status, Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onDetails: (p: Project) => void;
  onEdit: (p: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDetails, onEdit }) => {
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
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const { projects, addProject, updateProject, clients } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
      startDate: project.startDate.split('T')[0], // Ensure format for date input
      endDate: project.endDate.split('T')[0]
    });
    setIsFormOpen(true);
  };

  const handleDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsOpen(true);
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
        <button
          onClick={handleOpenNew}
          className="flex items-center space-x-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm"
        >
          <Plus size={18} />
          <span>Nova Obra</span>
        </button>
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
      {isFormOpen && (
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
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
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
      )}

      {/* DETAILS MODAL */}
      {isDetailsOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-start p-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-[#181418]">{selectedProject.title}</h3>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold bg-[#c79229]/20 text-[#c79229]`}>
                  {selectedProject.status}
                </span>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <User className="text-slate-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-slate-500">Cliente</p>
                  <p className="font-medium text-[#181418]">{selectedProject.clientName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-slate-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-slate-500">Endereço</p>
                  <p className="font-medium text-[#181418]">{selectedProject.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-slate-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-slate-500">Período</p>
                    <p className="font-medium text-[#181418] text-sm">
                      {new Date(selectedProject.startDate).toLocaleDateString()} até <br />
                      {new Date(selectedProject.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="text-slate-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-slate-500">Orçamento</p>
                    <p className="font-medium text-[#181418]">R$ {selectedProject.budget.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Progresso</span>
                  <span className="font-bold text-[#c79229]">{selectedProject.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-[#c79229] h-2 rounded-full" style={{ width: `${selectedProject.progress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
