
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Client, Project, FinancialRecord, Service, Proposal, Supplier, TeamMember, PaymentRecord, Status, UserData, UserPermissions, Measurement, DailyReport, ProjectTask, ProjectMilestone } from '../types';

interface DataContextType {
  // Configurações da Empresa
  companyName: string;
  setCompanyName: (name: string) => void;
  companyLogo: string | null;
  setCompanyLogo: (logo: string | null) => void;

  // Novos campos de configuração
  companyCNPJ: string;
  setCompanyCNPJ: (cnpj: string) => void;
  companyPhone: string;
  setCompanyPhone: (phone: string) => void;
  companyAddress: string;
  setCompanyAddress: (address: string) => void;
  companyEmail: string;
  setCompanyEmail: (email: string) => void;

  clients: Client[];
  addClient: (client: Client) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  projects: Project[];
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;

  financials: FinancialRecord[];
  addFinancialRecord: (record: FinancialRecord) => Promise<void>;
  updateFinancialRecord: (record: FinancialRecord) => Promise<void>;

  services: Service[];
  addService: (service: Service) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  proposals: Proposal[];
  addProposal: (proposal: Proposal) => Promise<void>;
  updateProposalStatus: (id: string, status: Status) => Promise<void>;

  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  teamMembers: TeamMember[];
  addTeamMember: (member: TeamMember) => Promise<void>;
  updateTeamMember: (member: TeamMember) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;

  payments: PaymentRecord[];
  addPayment: (payment: PaymentRecord) => Promise<void>;
  updatePayment: (payment: PaymentRecord) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;

  // Gerenciamento de Usuários do Sistema
  users: UserData[];
  addUser: (user: UserData) => Promise<void>;
  updateUser: (user: UserData) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;

  // Engenharia (Fase 2)
  measurements: Measurement[];
  addMeasurement: (measurement: Measurement) => Promise<void>;
  dailyReports: DailyReport[];
  addDailyReport: (report: DailyReport) => Promise<void>;
  updateDailyReport: (report: DailyReport) => Promise<void>;

  // Planejamento (Fase 2 - Etapa 2)
  projectTasks: ProjectTask[];
  addProjectTask: (task: ProjectTask) => Promise<void>;
  updateProjectTask: (task: ProjectTask) => Promise<void>;
  deleteProjectTask: (id: string) => Promise<void>;

  projectMilestones: ProjectMilestone[];
  addProjectMilestone: (milestone: ProjectMilestone) => Promise<void>;
  updateProjectMilestone: (milestone: ProjectMilestone) => Promise<void>;
  deleteProjectMilestone: (id: string) => Promise<void>;

  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- PERFIS PRÉ-DEFINIDOS (ROLE DEFINITIONS) ---
export const ROLE_DEFINITIONS: Record<string, UserPermissions> = {
  'Administrador': {
    viewFinancial: true,
    editFinancial: true,
    viewProjects: true,
    editProjects: true,
    manageSettings: true
  },
  'Gerente': {
    viewFinancial: true,
    editFinancial: false,
    viewProjects: true,
    editProjects: true,
    manageSettings: false
  },
  'Financeiro': {
    viewFinancial: true,
    editFinancial: true,
    viewProjects: true,
    editProjects: false,
    manageSettings: false
  },
  'Engenharia': {
    viewFinancial: false,
    editFinancial: false,
    viewProjects: true,
    editProjects: true,
    manageSettings: false
  },
  'RH': {
    viewFinancial: false,
    editFinancial: false,
    viewProjects: false,
    editProjects: false,
    manageSettings: false
  },
  'Visitante': {
    viewFinancial: false,
    editFinancial: false,
    viewProjects: false,
    editProjects: false,
    manageSettings: false
  }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Configurações Globais
  const [companyName, setCompanyName] = useState("JS ENGENHARIA LTDA");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const [companyCNPJ, setCompanyCNPJ] = useState("00.000.000/0001-00");
  const [companyPhone, setCompanyPhone] = useState("(11) 99999-9999");
  const [companyAddress, setCompanyAddress] = useState("Av. Engenheiro Luiz Carlos Berrini, 1000 - São Paulo, SP");
  const [companyEmail, setCompanyEmail] = useState("contato@jsengenharia.com.br");

  // Estados
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [financials, setFinancials] = useState<FinancialRecord[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar todos os dados
  const refreshData = async () => {
    try {
      setLoading(true);

      // Carregar clientes
      const { data: clientsData } = await supabase.from('clients').select('*');
      if (clientsData) {
        setClients(clientsData.map(c => ({
          id: c.id,
          name: c.name,
          document: c.document,
          email: c.email,
          phone: c.phone,
          address: c.address,
          type: c.type as 'Pessoa Física' | 'Pessoa Jurídica'
        })));
      }

      // Carregar projetos
      const { data: projectsData } = await supabase.from('projects').select('*, clients(name)');
      if (projectsData) {
        setProjects(projectsData.map(p => ({
          id: p.id,
          title: p.title,
          clientId: p.client_id,
          clientName: p.clients?.name || '',
          address: p.address,
          status: p.status as Status,
          startDate: p.start_date,
          endDate: p.end_date,
          budget: parseFloat(p.budget),
          progress: p.progress
        })));
      }

      // Carregar registros financeiros
      const { data: financialsData } = await supabase.from('financial_records').select('*').order('date', { ascending: false });
      if (financialsData) {
        setFinancials(financialsData.map(f => ({
          id: f.id,
          type: f.type as 'Receita' | 'Despesa',
          description: f.description,
          amount: parseFloat(f.amount),
          date: f.date,
          status: f.status as Status,
          category: f.category,
          projectId: f.project_id
        })));
      }

      // Carregar serviços
      const { data: servicesData } = await supabase.from('services').select('*');
      if (servicesData) {
        setServices(servicesData.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          basePrice: parseFloat(s.base_price),
          unit: s.unit
        })));
      }

      // Carregar propostas
      const { data: proposalsData } = await supabase.from('proposals').select('*, clients(name), proposal_items(*)');
      if (proposalsData) {
        setProposals(proposalsData.map(p => ({
          id: p.id,
          clientId: p.client_id,
          clientName: p.clients?.name || '',
          items: p.proposal_items?.map((item: any) => ({
            serviceId: item.service_id,
            name: item.name,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unit_price)
          })) || [],
          total: parseFloat(p.total),
          status: p.status as Status,
          date: p.date
        })));
      }

      // Carregar fornecedores
      const { data: suppliersData } = await supabase.from('suppliers').select('*');
      if (suppliersData) {
        setSuppliers(suppliersData.map(s => ({
          id: s.id,
          name: s.name,
          document: s.document,
          email: s.email,
          phone: s.phone,
          category: s.category
        })));
      }

      // Carregar membros da equipe
      const { data: teamData } = await supabase.from('team_members').select('*');
      if (teamData) {
        setTeamMembers(teamData.map(t => ({
          id: t.id,
          name: t.name,
          role: t.role,
          type: t.type,
          email: t.email,
          phone: t.phone,
          status: t.status
        })));
      }

      // Carregar pagamentos
      const { data: paymentsData } = await supabase.from('payment_records').select('*');
      if (paymentsData) {
        setPayments(paymentsData.map(p => ({
          id: p.id,
          name: p.name,
          reference: p.reference,
          date: p.date,
          value: parseFloat(p.value),
          status: p.status
        })));
      }

      // Carregar usuários
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) {
        setUsers(usersData.map(u => ({
          id: parseInt(u.id),
          name: u.name,
          email: u.email,
          role: u.role,
          permissions: {
            viewFinancial: u.view_financial,
            editFinancial: u.edit_financial,
            viewProjects: u.view_projects,
            editProjects: u.edit_projects,
            manageSettings: u.manage_settings
          }
        })));
      }

      // Carregar Medições
      const { data: measurementsData } = await supabase.from('measurements').select('*').order('date', { ascending: false });
      if (measurementsData) {
        setMeasurements(measurementsData.map(m => ({
          id: m.id,
          projectId: m.project_id,
          description: m.description,
          date: m.date,
          percentage: parseFloat(m.percentage),
          value: parseFloat(m.value),
          status: m.status as Status
        })));
      }

      // Carregar RDOs
      const { data: rdosData } = await supabase.from('daily_reports').select('*, daily_report_images(*)').order('date', { ascending: false });
      if (rdosData) {
        setDailyReports(rdosData.map(r => ({
          id: r.id,
          projectId: r.project_id,
          date: r.date,
          weatherMorning: r.weather_morning,
          weatherAfternoon: r.weather_afternoon,
          laborTotal: r.labor_total,
          equipmentNotes: r.equipment_notes,
          activitiesNotes: r.activities_notes,
          occurrencesNotes: r.occurrences_notes,
          createdAt: r.created_at,
          images: r.daily_report_images?.map((img: any) => ({
            id: img.id,
            reportId: img.report_id,
            url: img.url,
            caption: img.caption
          }))
        })));
      }

      // Carregar Tarefas
      const { data: tasksData } = await supabase.from('project_tasks').select('*');
      if (tasksData) {
        setProjectTasks(tasksData.map(t => ({
          id: t.id,
          projectId: t.project_id,
          title: t.title,
          startDate: t.start_date,
          endDate: t.end_date,
          progress: t.progress,
          dependencies: t.dependencies
        })));
      }

      // Carregar Marcos
      const { data: milestonesData } = await supabase.from('project_milestones').select('*');
      if (milestonesData) {
        setProjectMilestones(milestonesData.map(m => ({
          id: m.id,
          projectId: m.project_id,
          title: m.title,
          date: m.date,
          isCompleted: m.is_completed
        })));
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar
  useEffect(() => {
    refreshData();
  }, []);

  // --- CLIENTS ---
  const addClient = async (client: Client) => {
    const { data, error } = await supabase.from('clients').insert([{
      name: client.name,
      document: client.document,
      email: client.email,
      phone: client.phone,
      address: client.address,
      type: client.type
    }]).select().single();

    if (!error && data) {
      setClients(prev => [...prev, { ...client, id: data.id }]);
    }
  };

  const updateClient = async (client: Client) => {
    await supabase.from('clients').update({
      name: client.name,
      document: client.document,
      email: client.email,
      phone: client.phone,
      address: client.address,
      type: client.type
    }).eq('id', client.id);

    setClients(prev => prev.map(c => c.id === client.id ? client : c));
  };

  const deleteClient = async (id: string) => {
    await supabase.from('clients').delete().eq('id', id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // --- PROJECTS ---
  const addProject = async (project: Project) => {
    const { data, error } = await supabase.from('projects').insert([{
      title: project.title,
      client_id: project.clientId,
      address: project.address,
      status: project.status,
      start_date: project.startDate,
      end_date: project.endDate,
      budget: project.budget,
      progress: project.progress
    }]).select().single();

    if (!error && data) {
      setProjects(prev => [...prev, { ...project, id: data.id }]);
    }
  };

  const updateProject = async (project: Project) => {
    await supabase.from('projects').update({
      title: project.title,
      client_id: project.clientId,
      address: project.address,
      status: project.status,
      start_date: project.startDate,
      end_date: project.endDate,
      budget: project.budget,
      progress: project.progress
    }).eq('id', project.id);

    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  };

  // --- FINANCIAL RECORDS ---
  const addFinancialRecord = async (record: FinancialRecord) => {
    const { data, error } = await supabase.from('financial_records').insert([{
      type: record.type,
      description: record.description,
      amount: record.amount,
      date: record.date,
      status: record.status,
      category: record.category,
      project_id: record.projectId
    }]).select().single();

    if (!error && data) {
      setFinancials(prev => [{ ...record, id: data.id }, ...prev]);
    }
  };

  const updateFinancialRecord = async (record: FinancialRecord) => {
    await supabase.from('financial_records').update({
      type: record.type,
      description: record.description,
      amount: record.amount,
      date: record.date,
      status: record.status,
      category: record.category,
      project_id: record.projectId
    }).eq('id', record.id);

    setFinancials(prev => prev.map(f => f.id === record.id ? record : f));
  };

  // --- SERVICES ---
  const addService = async (service: Service) => {
    const { data, error } = await supabase.from('services').insert([{
      name: service.name,
      description: service.description,
      base_price: service.basePrice,
      unit: service.unit
    }]).select().single();

    if (!error && data) {
      setServices(prev => [...prev, { ...service, id: data.id }]);
    }
  };

  const updateService = async (service: Service) => {
    await supabase.from('services').update({
      name: service.name,
      description: service.description,
      base_price: service.basePrice,
      unit: service.unit
    }).eq('id', service.id);

    setServices(prev => prev.map(s => s.id === service.id ? service : s));
  };

  const deleteService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // --- PROPOSALS ---
  const addProposal = async (proposal: Proposal) => {
    const { data: proposalData, error: proposalError } = await supabase.from('proposals').insert([{
      client_id: proposal.clientId,
      total: proposal.total,
      status: proposal.status,
      date: proposal.date
    }]).select().single();

    if (!proposalError && proposalData) {
      // Inserir itens da proposta
      const items = proposal.items.map(item => ({
        proposal_id: proposalData.id,
        service_id: item.serviceId,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice
      }));

      await supabase.from('proposal_items').insert(items);

      setProposals(prev => [{ ...proposal, id: proposalData.id }, ...prev]);
    }
  };

  const updateProposalStatus = async (id: string, status: Status) => {
    await supabase.from('proposals').update({ status }).eq('id', id);
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // --- SUPPLIERS ---
  const addSupplier = async (supplier: Supplier) => {
    const { data, error } = await supabase.from('suppliers').insert([{
      name: supplier.name,
      document: supplier.document,
      email: supplier.email,
      phone: supplier.phone,
      category: supplier.category
    }]).select().single();

    if (!error && data) {
      setSuppliers(prev => [...prev, { ...supplier, id: data.id }]);
    }
  };

  const updateSupplier = async (supplier: Supplier) => {
    await supabase.from('suppliers').update({
      name: supplier.name,
      document: supplier.document,
      email: supplier.email,
      phone: supplier.phone,
      category: supplier.category
    }).eq('id', supplier.id);

    setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
  };

  const deleteSupplier = async (id: string) => {
    await supabase.from('suppliers').delete().eq('id', id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // --- TEAM MEMBERS ---
  const addTeamMember = async (member: TeamMember) => {
    const { data, error } = await supabase.from('team_members').insert([{
      name: member.name,
      role: member.role,
      type: member.type,
      email: member.email,
      phone: member.phone,
      status: member.status
    }]).select().single();

    if (!error && data) {
      setTeamMembers(prev => [...prev, { ...member, id: data.id }]);
    }
  };

  const updateTeamMember = async (member: TeamMember) => {
    await supabase.from('team_members').update({
      name: member.name,
      role: member.role,
      type: member.type,
      email: member.email,
      phone: member.phone,
      status: member.status
    }).eq('id', member.id);

    setTeamMembers(prev => prev.map(m => m.id === member.id ? member : m));
  };

  const deleteTeamMember = async (id: string) => {
    await supabase.from('team_members').delete().eq('id', id);
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  // --- PAYMENTS ---
  const addPayment = async (payment: PaymentRecord) => {
    const { data, error } = await supabase.from('payment_records').insert([{
      name: payment.name,
      reference: payment.reference,
      date: payment.date,
      value: payment.value,
      status: payment.status
    }]).select().single();

    if (!error && data) {
      setPayments(prev => [...prev, { ...payment, id: data.id }]);

      // Adicionar registro financeiro correspondente
      const financialStatus = (payment.status === 'Agendado' ? Status.PENDING : payment.status) as Status;
      await addFinancialRecord({
        id: data.id,
        type: 'Despesa',
        description: `Pagamento: ${payment.name} - ${payment.reference}`,
        amount: payment.value,
        date: payment.date,
        status: financialStatus,
        category: 'Mão de Obra',
      });
    }
  };

  const updatePayment = async (payment: PaymentRecord) => {
    await supabase.from('payment_records').update({
      name: payment.name,
      reference: payment.reference,
      date: payment.date,
      value: payment.value,
      status: payment.status
    }).eq('id', payment.id);

    setPayments(prev => prev.map(p => p.id === payment.id ? payment : p));

    // Atualizar registro financeiro correspondente
    const financialStatus = (payment.status === 'Agendado' ? Status.PENDING : payment.status) as Status;
    await updateFinancialRecord({
      id: payment.id,
      type: 'Despesa',
      description: `Pagamento: ${payment.name} - ${payment.reference}`,
      amount: payment.value,
      date: payment.date,
      status: financialStatus,
      category: 'Mão de Obra',
    });
  };

  const deletePayment = async (id: string) => {
    await supabase.from('payment_records').delete().eq('id', id);
    setPayments(prev => prev.filter(p => p.id !== id));

    // Remover registro financeiro correspondente
    await supabase.from('financial_records').delete().eq('id', id);
    setFinancials(prev => prev.filter(f => f.id !== id));
  };

  // --- USER MANAGEMENT ---
  const addUser = async (user: UserData) => {
    // Usuários são criados via Supabase Auth, apenas atualizar estado local
    setUsers(prev => [...prev, user]);
  };

  const updateUser = async (user: UserData) => {
    await supabase.from('users').update({
      name: user.name,
      role: user.role,
      view_financial: user.permissions.viewFinancial,
      edit_financial: user.permissions.editFinancial,
      view_projects: user.permissions.viewProjects,
      edit_projects: user.permissions.editProjects,
      manage_settings: user.permissions.manageSettings
    }).eq('id', user.id.toString());

    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  };

  const deleteUser = async (id: number) => {
    await supabase.from('users').delete().eq('id', id.toString());
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // --- MEASUREMENTS ---
  const addMeasurement = async (measurement: Measurement) => {
    const { data, error } = await supabase.from('measurements').insert([{
      project_id: measurement.projectId,
      description: measurement.description,
      date: measurement.date,
      percentage: measurement.percentage,
      value: measurement.value,
      status: measurement.status
    }]).select().single();

    if (!error && data) {
      setMeasurements(prev => [{ ...measurement, id: data.id }, ...prev]);

      // Atualizar progresso da obra
      const project = projects.find(p => p.id === measurement.projectId);
      if (project) {
        const newProgress = Math.min(100, (project.progress || 0) + measurement.percentage);
        await updateProject({ ...project, progress: newProgress });
      }

      // Adicionar registro financeiro (Receita)
      await addFinancialRecord({
        id: `M-${data.id}`,
        type: 'Receita',
        description: `Medição: ${measurement.description} - Obra: ${project?.title || measurement.projectId}`,
        amount: measurement.value,
        date: measurement.date,
        status: measurement.status,
        category: 'Obra',
        projectId: measurement.projectId
      });
    }
  };

  // --- DAILY REPORTS ---
  const addDailyReport = async (report: DailyReport) => {
    const { data, error } = await supabase.from('daily_reports').insert([{
      project_id: report.projectId,
      date: report.date,
      weather_morning: report.weatherMorning,
      weather_afternoon: report.weatherAfternoon,
      labor_total: report.laborTotal,
      equipment_notes: report.equipmentNotes,
      activities_notes: report.activitiesNotes,
      occurrences_notes: report.occurrencesNotes
    }]).select().single();

    if (!error && data) {
      setDailyReports(prev => [{ ...report, id: data.id }, ...prev]);
    }
  };

  const updateDailyReport = async (report: DailyReport) => {
    await supabase.from('daily_reports').update({
      date: report.date,
      weather_morning: report.weatherMorning,
      weather_afternoon: report.weatherAfternoon,
      labor_total: report.laborTotal,
      equipment_notes: report.equipmentNotes,
      activities_notes: report.activitiesNotes,
      occurrences_notes: report.occurrencesNotes
    }).eq('id', report.id);

    setDailyReports(prev => prev.map(r => r.id === report.id ? report : r));
  };

  // --- PROJECT TASKS ---
  const addProjectTask = async (task: ProjectTask) => {
    const { data, error } = await supabase.from('project_tasks').insert([{
      project_id: task.projectId,
      title: task.title,
      start_date: task.startDate,
      end_date: task.endDate,
      progress: task.progress,
      dependencies: task.dependencies
    }]).select().single();

    if (!error && data) {
      setProjectTasks(prev => [...prev, { ...task, id: data.id }]);
    }
  };

  const updateProjectTask = async (task: ProjectTask) => {
    await supabase.from('project_tasks').update({
      title: task.title,
      start_date: task.startDate,
      end_date: task.endDate,
      progress: task.progress,
      dependencies: task.dependencies
    }).eq('id', task.id);

    setProjectTasks(prev => prev.map(t => t.id === task.id ? task : t));
  };

  const deleteProjectTask = async (id: string) => {
    await supabase.from('project_tasks').delete().eq('id', id);
    setProjectTasks(prev => prev.filter(t => t.id !== id));
  };

  // --- PROJECT MILESTONES ---
  const addProjectMilestone = async (milestone: ProjectMilestone) => {
    const { data, error } = await supabase.from('project_milestones').insert([{
      project_id: milestone.projectId,
      title: milestone.title,
      date: milestone.date,
      is_completed: milestone.isCompleted
    }]).select().single();

    if (!error && data) {
      setProjectMilestones(prev => [...prev, { ...milestone, id: data.id }]);
    }
  };

  const updateProjectMilestone = async (milestone: ProjectMilestone) => {
    await supabase.from('project_milestones').update({
      title: milestone.title,
      date: milestone.date,
      is_completed: milestone.isCompleted
    }).eq('id', milestone.id);

    setProjectMilestones(prev => prev.map(m => m.id === milestone.id ? milestone : m));
  };

  const deleteProjectMilestone = async (id: string) => {
    await supabase.from('project_milestones').delete().eq('id', id);
    setProjectMilestones(prev => prev.filter(m => m.id !== id));
  };

  return (
    <DataContext.Provider value={{
      companyName, setCompanyName,
      companyLogo, setCompanyLogo,
      companyCNPJ, setCompanyCNPJ,
      companyPhone, setCompanyPhone,
      companyAddress, setCompanyAddress,
      companyEmail, setCompanyEmail,
      clients, addClient, updateClient, deleteClient,
      projects, addProject, updateProject,
      financials, addFinancialRecord, updateFinancialRecord,
      services, addService, updateService, deleteService,
      proposals, addProposal, updateProposalStatus,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      teamMembers, addTeamMember, updateTeamMember, deleteTeamMember,
      payments, addPayment, updatePayment, deletePayment,
      users, addUser, updateUser, deleteUser,
      measurements, addMeasurement,
      dailyReports, addDailyReport, updateDailyReport,
      projectTasks, addProjectTask, updateProjectTask, deleteProjectTask,
      projectMilestones, addProjectMilestone, updateProjectMilestone, deleteProjectMilestone,
      loading,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
