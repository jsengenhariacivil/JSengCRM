
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Client, Project, FinancialRecord, Service, Proposal, ProposalItem, ProposalEtapa, SinapiService, Supplier, TeamMember, PaymentRecord, Status, UserData, UserPermissions, AgendaEvento, AppNotification, ProposalHistory, Measurement, DailyReport, ProjectTask, ProjectMilestone, Lead, LeadInteraction, InventoryItem, InventoryMovement, Goal } from '../types';

interface DataContextType {
  // Base SINAPI (Mock)
  sinapiDatabase: SinapiService[];

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
  deleteProject: (id: string) => Promise<void>;

  financials: FinancialRecord[];
  addFinancialRecord: (record: FinancialRecord) => Promise<void>;
  updateFinancialRecord: (record: FinancialRecord) => Promise<void>;
  deleteFinancialRecord: (id: string) => Promise<void>;

  services: Service[];
  addService: (service: Service) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  proposals: Proposal[];
  addProposal: (proposal: Proposal) => Promise<void>;
  updateProposal: (proposal: Proposal) => Promise<void>;
  updateProposalStatus: (id: string, status: Status) => Promise<void>;
  deleteProposal: (id: string) => Promise<void>;

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
  deleteUser: (id: string) => Promise<void>;

  // --- AGENDA GERENCIAL ---
  agendaEventos: AgendaEvento[];
  addAgendaEvent: (evento: AgendaEvento) => Promise<void>;
  updateAgendaEvent: (evento: AgendaEvento) => Promise<void>;
  deleteAgendaEvent: (id: string) => Promise<void>;
  syncAgendaEvent: (origemModulo: 'OBRA' | 'ORCAMENTO' | 'FINANCEIRO', idReferencia: string, eventoData: Partial<AgendaEvento>) => Promise<void>;

  // --- NOTIFICACOES E FOLLOW UP ---
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'created_at'>) => Promise<void>;
  proposalHistory: ProposalHistory[];
  addProposalHistory: (history: Omit<ProposalHistory, 'id' | 'created_at'>) => Promise<void>;

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

  // --- CRM / LEADS ---
  leads: Lead[];
  addLead: (lead: Lead) => Promise<void>;
  updateLead: (lead: Lead) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addLeadInteraction: (interaction: Omit<LeadInteraction, 'id' | 'createdAt'>) => Promise<void>;

  // --- INVENTORY ---
  inventoryItems: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => Promise<void>;
  updateInventoryItem: (item: InventoryItem) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  addInventoryMovement: (movement: Omit<InventoryMovement, 'id' | 'date'>) => Promise<void>;

  // --- GOALS ---
  goals: Goal[];
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const ROLE_DEFINITIONS: Record<string, UserPermissions> = {
  'Administrador': {
    viewFinancial: true,
    editFinancial: true,
    viewProjects: true,
    editProjects: true,
    viewProposals: true,
    editProposals: true,
    viewTeam: true,
    manageSettings: true
  },
  'Gerente': {
    viewFinancial: true,
    editFinancial: false,
    viewProjects: true,
    editProjects: true,
    viewProposals: true,
    editProposals: true,
    viewTeam: true,
    manageSettings: false
  },
  'Financeiro': {
    viewFinancial: true,
    editFinancial: true,
    viewProjects: true,
    editProjects: false,
    viewProposals: false,
    editProposals: false,
    viewTeam: true,
    manageSettings: false
  },
  'Comercial': {
    viewFinancial: false,
    editFinancial: false,
    viewProjects: true,
    editProjects: false,
    viewProposals: true,
    editProposals: true,
    viewTeam: false,
    manageSettings: false
  },
  'Engenharia': {
    viewFinancial: false,
    editFinancial: false,
    viewProjects: true,
    editProjects: true,
    viewProposals: true,
    editProposals: false,
    viewTeam: false,
    manageSettings: false
  },
  'RH': {
    viewFinancial: false,
    editFinancial: false,
    viewProjects: false,
    editProjects: false,
    viewProposals: false,
    editProposals: false,
    viewTeam: true,
    manageSettings: false
  },
  'Visitante': {
    viewFinancial: false,
    editFinancial: false,
    viewProjects: false,
    editProjects: false,
    viewProposals: false,
    editProposals: false,
    viewTeam: false,
    manageSettings: false
  }
};

export const MOCK_SINAPI_DB: SinapiService[] = [
  { code: '88309', description: 'PEDREIRO COM ENCARGOS COMPLEMENTARES', unit: 'H', price: 23.45 },
  { code: '88316', description: 'SERVENTE COM ENCARGOS COMPLEMENTARES', unit: 'H', price: 17.80 },
  { code: '94273', description: 'ASSENTAMENTO DE GUIA (MEIO-FIO) EM TRECHO RETO, CONFECCIONADA EM CONCRETO PRÉ-FABRICADO', unit: 'M', price: 54.20 },
  { code: '87298', description: 'REVESTIMENTO CERÂMICO PARA PISOS COM PLACAS TIPO ESMALTADA EXTRA DE DIMENSÕES 45X45 CM', unit: 'M2', price: 68.90 },
  { code: '90443', description: 'RASGO EM ALVENARIA PARA RAMAIS/ DISTRIBUIÇÃO COM DIAMETRO ATÉ 40 MM', unit: 'M', price: 12.30 },
  { code: '100860', description: 'CHUVEIRO ELÉTRICO COMUM CORPO PLÁSTICO, TIPO DUCHA SUPERMÁXIMO OU EQUIVALENTE', unit: 'UN', price: 125.00 },
  { code: '89509', description: 'PINTURA ACRÍLICA EM CORES SOBRE PAREDES, COM DUAS DEMÃOS', unit: 'M2', price: 21.50 },
  { code: '94963', description: 'CONCRETO FCK = 25MPA, TRAÇO 1:2,3:2,7 (EM MASSA SECA DE CIMENTO/ AREIA MÉDIA/ BRITA 1)', unit: 'M3', price: 450.00 }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Configurações Globais (com persistência no localStorage)
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('companyName') || "JS ENGENHARIA LTDA");
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => localStorage.getItem('companyLogo') || null);

  const [companyCNPJ, setCompanyCNPJ] = useState(() => localStorage.getItem('companyCNPJ') || "00.000.000/0001-00");
  const [companyPhone, setCompanyPhone] = useState(() => localStorage.getItem('companyPhone') || "(11) 99999-9999");
  const [companyAddress, setCompanyAddress] = useState(() => localStorage.getItem('companyAddress') || "Av. Engenheiro Luiz Carlos Berrini, 1000 - São Paulo, SP");
  const [companyEmail, setCompanyEmail] = useState(() => localStorage.getItem('companyEmail') || "contato@jsengenharia.com.br");

  // Salvar no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('companyName', companyName);
    if (companyLogo) {
      localStorage.setItem('companyLogo', companyLogo);
    } else {
      localStorage.removeItem('companyLogo');
    }
    localStorage.setItem('companyCNPJ', companyCNPJ);
    localStorage.setItem('companyPhone', companyPhone);
    localStorage.setItem('companyAddress', companyAddress);
    localStorage.setItem('companyEmail', companyEmail);
  }, [companyName, companyLogo, companyCNPJ, companyPhone, companyAddress, companyEmail]);

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
  const [agendaEventos, setAgendaEventos] = useState<AgendaEvento[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [proposalHistory, setProposalHistory] = useState<ProposalHistory[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar todos os dados
  const refreshData = async () => {
    try {
      setLoading(true);

      const loadAllData = async () => {
        const [
          clientsData, projectsData, financialsData, servicesData,
          proposalsData, suppliersData, teamData, paymentsData, usersData, agendaData,
          notificationsData, proposalHistoryData, leadsData, inventoryData, goalsData
        ] = await Promise.all([
          supabase.from('clients').select('*'),
          supabase.from('projects').select('*, clients(name)'),
          supabase.from('financial_records').select('*').order('date', { ascending: false }),
          supabase.from('services').select('*'),
          supabase.from('proposals').select('*, clients(name), proposal_items(*), proposal_etapas(*)'),
          supabase.from('suppliers').select('*'),
          supabase.from('team_members').select('*'),
          supabase.from('payment_records').select('*'),
          supabase.from('users').select('*'),
          supabase.from('agenda_eventos').select('*').order('data_inicio', { ascending: true }),
          supabase.from('notifications').select('*').order('created_at', { ascending: false }),
          supabase.from('proposal_history').select('*').order('created_at', { ascending: false }),
          supabase.from('leads').select('*').order('created_at', { ascending: false }),
          supabase.from('inventory_items').select('*'),
          supabase.from('goals').select('*')
        ]);

        if (clientsData.data) {
          setClients(clientsData.data.map(c => ({
            id: c.id,
            name: c.name,
            document: c.document,
            email: c.email,
            phone: c.phone,
            address: c.address,
            type: c.type as 'Pessoa Física' | 'Pessoa Jurídica'
          })));
        }

        if (projectsData.data) {
          setProjects(projectsData.data.map(p => ({
            id: p.id,
            title: p.title,
            clientId: p.client_id,
            clientName: p.clients?.name || '',
            address: p.address,
            status: p.status as Status,
            startDate: p.start_date,
            endDate: p.end_date,
            budget: parseFloat(p.budget),
            progress: p.progress,
            proposalId: p.proposal_id
          })));
        }

        if (financialsData.data) {
          setFinancials(financialsData.data.map(f => ({
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

        if (servicesData.data) {
          setServices(servicesData.data.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            basePrice: parseFloat(s.base_price),
            unit: s.unit
          })));
        }

        if (proposalsData.data) {
          // Note: Since Supabase might not return nested correctly if we don't query properly,
          // we use the current returned items to reconstruct a flat list, but ideally we add proposal_etapas in the select.
          // Wait, we need to fetch proposal_etapas! Since we didn't add it to the Promise.all select yet, let's just do a basic map but be ready to accept etapas.
          // To fetch etapas, we need to update the query: select('*, clients(name), proposal_items(*), proposal_etapas(*)')
          // For now, let's map what we have and assume we will fix the query next.
          setProposals(proposalsData.data.map(p => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const allItems: any[] = p.proposal_items || [];

            // Reconstruct the tree if they have parent_id
            const itemMap = new Map();
            const rootItems: any[] = [];

            allItems.forEach(item => {
              itemMap.set(item.id, {
                id: item.id,
                proposalId: p.id,
                etapaId: item.etapa_id,
                parentId: item.parent_id,
                serviceId: item.service_id,
                code: item.code || '',
                banco: item.banco || 'PROPRIO',
                name: item.name,
                type: item.type || 'INSUMO',
                origin: item.origin || 'BASE',
                version: item.version || 1,
                quantity: parseFloat(item.quantity) || 0,
                unitPrice: parseFloat(item.unit_price) || 0,
                unit: item.unit || 'un',
                order: item.order || 0,
                children: []
              });
            });

            allItems.forEach(item => {
              const mapped = itemMap.get(item.id);
              if (item.parent_id && itemMap.has(item.parent_id)) {
                itemMap.get(item.parent_id).children.push(mapped);
              } else {
                rootItems.push(mapped);
              }
            });

            // Group by Etapa
            const etapasMap = new Map();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pEtapas: any[] = p.proposal_etapas || [];
            pEtapas.forEach(et => {
              etapasMap.set(et.id, {
                id: et.id,
                name: et.name,
                order: et.order,
                items: []
              });
            });

            rootItems.forEach(item => {
              if (item.etapaId && etapasMap.has(item.etapaId)) {
                etapasMap.get(item.etapaId).items.push(item);
              } else {
                // Fallback if no etapa
                if (!etapasMap.has('default')) {
                  etapasMap.set('default', { id: 'default', name: 'Serviços Gerais', order: 0, items: [] });
                }
                etapasMap.get('default').items.push(item);
              }
            });

            const etapasArray = Array.from(etapasMap.values()).sort((a, b) => a.order - b.order);

            return {
              id: p.id,
              clientId: p.client_id,
              clientName: p.clients?.name || '',
              etapas: etapasArray,
              items: rootItems, // Keep legacy reference
              total: parseFloat(p.total) || 0,
              bdi: parseFloat(p.bdi) || 0,
              status: p.status as Status,
              date: p.date
            };
          }));
        }

        if (suppliersData.data) {
          setSuppliers(suppliersData.data.map(s => ({
            id: s.id,
            name: s.name,
            document: s.document,
            email: s.email,
            phone: s.phone,
            category: s.category
          })));
        }

        if (teamData.data) {
          setTeamMembers(teamData.data.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            type: t.type,
            email: t.email,
            phone: t.phone,
            status: t.status
          })));
        }

        if (paymentsData.data) {
          setPayments(paymentsData.data.map(p => ({
            id: p.id,
            name: p.name,
            reference: p.reference,
            date: p.date,
            value: parseFloat(p.value),
            status: p.status
          })));
        }

        if (usersData.data) {
          setUsers(usersData.data.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            permissions: {
              viewFinancial: u.view_financial,
              editFinancial: u.edit_financial,
              viewProjects: u.view_projects,
              editProjects: u.edit_projects,
              viewProposals: u.view_proposals || false,
              editProposals: u.edit_proposals || false,
              viewTeam: u.view_team || false,
              manageSettings: u.manage_settings
            }
          })));
        }

        if (agendaData.data) {
          setAgendaEventos(agendaData.data.map(a => ({
            id: a.id,
            origemModulo: a.origem_modulo,
            idReferencia: a.id_referencia,
            tipoEvento: a.tipo_evento,
            titulo: a.titulo,
            descricao: a.descricao,
            responsavel: a.responsavel,
            setor: a.setor,
            dataInicio: a.data_inicio,
            dataFim: a.data_fim,
            prioridade: a.prioridade,
            status: a.status,
            linkInterno: a.link_interno,
            criadoAutomatico: a.criado_automatico,
            eventoCritico: a.evento_critico,
            createdAt: a.created_at
          })));
        }

        if (notificationsData.data) {
          setNotifications(notificationsData.data.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            is_read: n.is_read,
            user_id: n.user_id,
            created_at: n.created_at
          })));
        }

        if (proposalHistoryData.data) {
          setProposalHistory(proposalHistoryData.data.map(ph => ({
            id: ph.id,
            proposal_id: ph.proposal_id,
            description: ph.description,
            contact_type: ph.contact_type,
            user_name: ph.user_name,
            created_at: ph.created_at
          })));
        }

        if (leadsData.data) {
          setLeads(leadsData.data.map(l => ({
            id: l.id,
            name: l.name,
            company: l.company,
            email: l.email,
            phone: l.phone,
            status: l.status,
            source: l.source,
            notes: l.notes,
            value: parseFloat(l.value) || 0,
            assignedTo: l.assigned_to,
            createdAt: l.created_at,
            lastContact: l.last_contact
          })));
        }

        if (inventoryData.data) {
          setInventoryItems(inventoryData.data.map(i => ({
            id: i.id,
            name: i.name,
            category: i.category,
            unit: i.unit,
            quantity: i.quantity,
            minQuantity: i.min_quantity,
            location: i.location,
            unitPrice: parseFloat(i.unit_price) || 0,
            lastRestocked: i.last_restocked,
            supplierId: i.supplier_id,
            status: i.status
          })));
        }

        if (goalsData.data) {
          setGoals(goalsData.data.map(g => ({
            id: g.id,
            title: g.title,
            target: parseFloat(g.target) || 0,
            current: parseFloat(g.current) || 0,
            type: g.type,
            deadline: g.deadline,
            status: g.status
          })));
        }
      };

      await loadAllData();

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
    try {
      const { data, error } = await supabase.from('clients').insert([{
        name: client.name,
        document: client.document,
        email: client.email,
        phone: client.phone,
        address: client.address,
        type: client.type
      }]).select().single();

      if (error) {
        console.error('Error adding client:', error);
        throw new Error(`Erro ao salvar cliente: ${error.message}`);
      }

      if (data) {
        setClients(prev => [...prev, { ...client, id: data.id }]);
      }
    } catch (err) {
      console.error('Falha inesperada em addClient:', err);
      throw err;
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
    try {
      const { data, error } = await supabase.from('projects').insert([{
        title: project.title,
        client_id: project.clientId,
        address: project.address,
        status: project.status,
        start_date: project.startDate,
        end_date: project.endDate,
        budget: project.budget,
        progress: project.progress,
        proposal_id: project.proposalId
      }]).select().single();

      if (error) {
        console.error('Error adding project:', error);
        throw new Error(`Erro ao salvar projeto: ${error.message}`);
      }

      if (data) {
        const newProject = { ...project, id: data.id };
        setProjects(prev => [...prev, newProject]);

        // Registro Financeiro Automático (Receita Pendente)
        if (newProject.budget > 0) {
          await addFinancialRecord({
            id: '', // será gerado pelo backend mas precisa tipagem local inicial
            type: 'Receita',
            description: `Recebimento Obra: ${newProject.title}`,
            amount: newProject.budget,
            date: newProject.startDate,
            status: Status.PENDING,
            category: 'Serviços',
            projectId: newProject.id
          });
        }

        // Sincronizar com Agenda
        if (newProject.endDate) {
          const safeDateStr = newProject.endDate.length === 10 ? `${newProject.endDate}T09:00:00` : newProject.endDate;
          syncAgendaEvent('OBRA', newProject.id, {
            tipoEvento: 'PRAZO FINAL OBRA',
            titulo: `Prazo Final - ${newProject.title}`,
            descricao: `Prazo contratual de término da obra ${newProject.title}.`,
            dataInicio: safeDateStr,
            dataFim: safeDateStr,
            prioridade: 'ALTA',
            eventoCritico: true
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error('Falha inesperada em addProject:', err);
      throw err;
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

    // Sincronizar com Agenda
    if (project.endDate) {
      const safeDateStr = project.endDate.length === 10 ? `${project.endDate}T09:00:00` : project.endDate;
      syncAgendaEvent('OBRA', project.id, {
        tipoEvento: 'PRAZO FINAL OBRA',
        titulo: `Prazo Final - ${project.title}`,
        descricao: `Prazo contratual de término da obra ${project.title}.`,
        dataInicio: safeDateStr,
        dataFim: safeDateStr,
        prioridade: 'ALTA',
        eventoCritico: true
      }).catch(console.error);
    }
  };

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));

    // Remover eventos da agenda vinculados
    const eventosVinculados = agendaEventos.filter(a => a.origemModulo === 'OBRA' && a.idReferencia === id);
    for (const ev of eventosVinculados) {
      await deleteAgendaEvent(ev.id).catch(console.error);
    }
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

  const deleteFinancialRecord = async (id: string) => {
    await supabase.from('financial_records').delete().eq('id', id);
    setFinancials(prev => prev.filter(f => f.id !== id));
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
      bdi: proposal.bdi || 0,
      status: proposal.status,
      date: proposal.date
    }]).select().single();

    if (proposalError) {
      console.error('Error creating proposal:', proposalError);
      alert('Erro Fatal ao salvar Proposta: ' + proposalError.message);
      return;
    }

    if (proposalData) {
      // Inserir etapas
      if (proposal.etapas && proposal.etapas.length > 0) {
        for (const etapa of proposal.etapas) {
          const { data: etapaData, error: etapaError } = await supabase.from('proposal_etapas').insert([{
            proposal_id: proposalData.id,
            name: etapa.name,
            order: etapa.order
          }]).select().single();

          if (etapaError) {
            console.error('Erro ao salvar etapa:', etapaError);
            alert(`Erro fatal na etapa "${etapa.name}": ${etapaError.message}`);
            continue;
          }

          if (etapaData) {
            // Função recursiva para inserir itens e subitens
            const insertItemsRecursive = async (items: ProposalItem[], parentId: string | null = null) => {
              for (const item of items) {
                const { data: itemData, error: itemError } = await supabase.from('proposal_items').insert([{
                  proposal_id: proposalData.id,
                  etapa_id: etapaData.id,
                  parent_id: parentId,
                  service_id: item.serviceId && item.serviceId.length >= 32 ? item.serviceId : null,
                  code: item.code || (item.serviceId && item.serviceId.length < 32 ? item.serviceId : ''),
                  banco: item.banco || 'PROPRIO',
                  name: item.name,
                  type: item.type || 'INSUMO',
                  origin: item.origin || 'BASE',
                  version: item.version || 1,
                  quantity: item.quantity,
                  unit_price: item.unitPrice,
                  unit: item.unit || 'un',
                  order: item.order || 0
                }]).select().single();

                if (itemError) {
                  console.error('Erro ao salvar item:', itemError);
                  alert(`Erro fatal no item "${item.name}": ${itemError.message}`);
                }

                if (itemData && item.children && item.children.length > 0) {
                  await insertItemsRecursive(item.children, itemData.id);
                }
              }
            };
            if (etapa.items) {
              await insertItemsRecursive(etapa.items);
            }
          }
        }
      }

      // Legacy fallback
      if (proposal.items && proposal.items.length > 0) {
        const flatItems = proposal.items.map(item => ({
          proposal_id: proposalData.id,
          service_id: item.serviceId && item.serviceId.length >= 32 ? item.serviceId : null,
          code: item.code || (item.serviceId && item.serviceId.length < 32 ? item.serviceId : ''),
          banco: item.banco || 'PROPRIO',
          name: item.name,
          type: item.type || 'INSUMO',
          origin: item.origin || 'BASE',
          version: item.version || 1,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          unit: item.unit || 'un',
          order: item.order || 0
        }));
        await supabase.from('proposal_items').insert(flatItems);
      }

      setProposals(prev => [{ ...proposal, id: proposalData.id }, ...prev]);

      // Integração Automática com Obras
      if (proposal.status === Status.APPROVED) {
        try {
          const jaExisteObra = projects.find(p => p.proposalId === proposalData.id);
          if (!jaExisteObra) {
            await addProject({
              id: '',
              title: `Obra: ${proposal.clientName} - #${proposalData.id.substring(0, 8)}`,
              clientId: proposal.clientId,
              clientName: proposal.clientName,
              address: '',
              status: Status.PENDING,
              startDate: proposal.date || new Date().toISOString().split('T')[0],
              endDate: '',
              budget: proposal.total,
              progress: 0,
              proposalId: proposalData.id
            });
          }
        } catch (err) {
          console.error('Erro na integração automática com obras:', err);
          alert('A proposta foi salva, mas houve um erro ao criar a obra. Verifique se a coluna "proposal_id" existe na tabela "projects" do Supabase.');
        }
      }

      // Sincronizar com a Agenda
      if (proposal.date) {
        const dataVencimento = new Date(proposal.date.length === 10 ? `${proposal.date}T09:00:00` : proposal.date);
        dataVencimento.setDate(dataVencimento.getDate() + 15); // Validade padrão de 15 dias
        const vencimentoStr = dataVencimento.toISOString();

        syncAgendaEvent('ORCAMENTO', proposalData.id, {
          tipoEvento: 'VENCIMENTO DE PROPOSTA',
          titulo: `Vencimento Proposta - ${proposal.clientName}`,
          descricao: `Aviso automático de vencimento da proposta (validade padrão de 15 dias a partir da criação).`,
          dataInicio: vencimentoStr,
          dataFim: vencimentoStr,
          prioridade: 'ALTA',
          eventoCritico: true
        }).catch(console.error);
      }
    }
  };

  const updateProposalStatus = async (id: string, status: Status) => {
    await supabase.from('proposals').update({ status }).eq('id', id);
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));

    // Integração Automática com Obras
    if (status === Status.APPROVED) {
      const proposal = proposals.find(p => p.id === id);
      if (proposal) {
        const safeTotal = proposal.total || 0;
        try {
          const jaExisteObra = projects.find(p => p.proposalId === id);

          if (!jaExisteObra) {
            await addProject({
              id: '',
              title: `Obra: ${proposal.clientName} - #${proposal.id.substring(0, 8)}`,
              clientId: proposal.clientId,
              clientName: proposal.clientName,
              address: '', // Placeholder
              status: Status.PENDING,
              startDate: proposal.date || new Date().toISOString().split('T')[0],
              endDate: '',
              budget: safeTotal,
              progress: 0,
              proposalId: proposal.id
            });
          }
        } catch (err) {
          console.error('Erro na integração automática com obras:', err);
          alert('O status foi atualizado, mas houve um erro ao criar a obra. Verifique se a coluna "proposal_id" existe na tabela "projects" no seu Supabase.');
        }

        // Dispara Notificação
        try {
          await addNotification({
            title: 'Proposta Aprovada! 🎉',
            message: `Proposta #${proposal.id.substring(0, 8)} do cliente ${proposal.clientName} aprovada. Valor: R$ ${safeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
            type: 'success',
            is_read: false
          });
        } catch (e) {
          console.error('Erro ao criar notificação:', e);
        }
      }
    }
  };

  const updateProposal = async (proposal: Proposal) => {
    if (!proposal.id) return;

    // Atualiza cabeçalho
    const { error: proposalError } = await supabase.from('proposals').update({
      client_id: proposal.clientId,
      total: proposal.total,
      bdi: proposal.bdi || 0,
      status: proposal.status,
      date: proposal.date
    }).eq('id', proposal.id);

    if (proposalError) {
      console.error('Error updating proposal:', proposalError);
      alert('Erro Fatal ao atualizar Proposta: ' + proposalError.message);
      return;
    }

    // Deleta árvore antiga (graças ao CASCADE do BD ou faremos manual abaixo para segurança)
    await supabase.from('proposal_etapas').delete().eq('proposal_id', proposal.id);
    await supabase.from('proposal_items').delete().eq('proposal_id', proposal.id);

    // Reinsere a árvore atualizada
    if (proposal.etapas && proposal.etapas.length > 0) {
      for (const etapa of proposal.etapas) {
        const { data: etapaData, error: etapaError } = await supabase.from('proposal_etapas').insert([{
          proposal_id: proposal.id,
          name: etapa.name,
          order: etapa.order
        }]).select().single();

        if (etapaError) {
          console.error('Erro ao salvar etapa na atualização:', etapaError);
          continue;
        }

        if (etapaData) {
          const insertItemsRecursive = async (items: ProposalItem[], parentId: string | null = null) => {
            for (const item of items) {
              const { data: itemData, error: itemError } = await supabase.from('proposal_items').insert([{
                proposal_id: proposal.id,
                etapa_id: etapaData.id,
                parent_id: parentId,
                service_id: item.serviceId && item.serviceId.length >= 32 ? item.serviceId : null,
                code: item.code || (item.serviceId && item.serviceId.length < 32 ? item.serviceId : ''),
                banco: item.banco || 'PROPRIO',
                name: item.name,
                type: item.type || 'INSUMO',
                origin: item.origin || 'BASE',
                version: item.version || 1,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                unit: item.unit || 'un',
                order: item.order || 0
              }]).select().single();

              if (!itemError && itemData && item.children && item.children.length > 0) {
                await insertItemsRecursive(item.children, itemData.id);
              }
            }
          };
          if (etapa.items) {
            await insertItemsRecursive(etapa.items);
          }
        }
      }
    }

    setProposals(prev => prev.map(p => p.id === proposal.id ? proposal : p));

    // Integração Financeira e Central de Notificações
    if (proposal.status === Status.APPROVED) {
      const safeTotal = proposal.total || 0;

      // Dispara Notificação Global (Sininho)
      try {
        await addNotification({
          title: 'Proposta Atualizada ✅',
          message: `Proposta do cliente ${proposal.clientName} atualizada. Valor: R$ ${safeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
          type: 'info',
          is_read: false
        });
      } catch (e) {
        console.error('Erro ao criar notificação:', e);
      }

      const jaExiste = financials.find(f => f.description === `Receita Ref. Proposta #${proposal.id}`);
      if (!jaExiste && safeTotal > 0) {
        await addFinancialRecord({
          id: '',
          type: 'Receita',
          description: `Receita Ref. Proposta #${proposal.id}`,
          amount: safeTotal,
          date: proposal.date ? new Date(proposal.date).toISOString() : new Date().toISOString(),
          status: Status.PENDING,
          category: 'Projeto',
        });
      }
    }
  };

  const deleteProposal = async (id: string) => {
    const { error } = await supabase.from('proposals').delete().eq('id', id);
    if (!error) {
      setProposals(prev => prev.filter(p => p.id !== id));
      // Apagar da Agenda também, se existir
      supabase.from('agenda_eventos').delete().eq('id_referencia', id).then();
    } else {
      console.error('Erro ao excluir proposta:', error);
      alert('Erro ao excluir proposta: ' + error.message);
    }
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

    if (error) throw new Error(error.message);
    if (data) {
      setSuppliers(prev => [...prev, { ...supplier, id: data.id }]);
    }
  };

  const updateSupplier = async (supplier: Supplier) => {
    const { error } = await supabase.from('suppliers').update({
      name: supplier.name,
      document: supplier.document,
      email: supplier.email,
      phone: supplier.phone,
      category: supplier.category
    }).eq('id', supplier.id);

    if (error) throw new Error(error.message);
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

    if (error) throw new Error(error.message);
    if (data) {
      setTeamMembers(prev => [...prev, { ...member, id: data.id }]);
    }
  };

  const updateTeamMember = async (member: TeamMember) => {
    const { error } = await supabase.from('team_members').update({
      name: member.name,
      role: member.role,
      type: member.type,
      email: member.email,
      phone: member.phone,
      status: member.status
    }).eq('id', member.id);

    if (error) throw new Error(error.message);
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

    if (error) throw new Error(error.message);
    if (data) {
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
    const { error } = await supabase.from('payment_records').update({
      name: payment.name,
      reference: payment.reference,
      date: payment.date,
      value: payment.value,
      status: payment.status
    }).eq('id', payment.id);

    if (error) throw new Error(error.message);
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

  const deleteUser = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // --- AGENDA GERENCIAL ---
  const addAgendaEvent = async (evento: AgendaEvento) => {
    const payload = {
      origem_modulo: evento.origemModulo,
      id_referencia: evento.idReferencia,
      tipo_evento: evento.tipoEvento,
      titulo: evento.titulo,
      descricao: evento.descricao,
      responsavel: evento.responsavel,
      setor: evento.setor,
      data_inicio: evento.dataInicio,
      data_fim: evento.dataFim,
      prioridade: evento.prioridade,
      status: evento.status,
      link_interno: evento.linkInterno,
      criado_automatico: evento.criadoAutomatico,
      evento_critico: evento.eventoCritico
    };

    const { data, error } = await supabase.from('agenda_eventos').insert([payload]).select();
    if (error) throw new Error(error.message);
    if (data) setAgendaEventos(prev => [...prev, { ...evento, id: data[0].id }]);
  };

  const updateAgendaEvent = async (evento: AgendaEvento) => {
    const payload = {
      origem_modulo: evento.origemModulo,
      id_referencia: evento.idReferencia,
      tipo_evento: evento.tipoEvento,
      titulo: evento.titulo,
      descricao: evento.descricao,
      responsavel: evento.responsavel,
      setor: evento.setor,
      data_inicio: evento.dataInicio,
      data_fim: evento.dataFim,
      prioridade: evento.prioridade,
      status: evento.status,
      link_interno: evento.linkInterno,
      criado_automatico: evento.criadoAutomatico,
      evento_critico: evento.eventoCritico
    };
    const { error } = await supabase.from('agenda_eventos').update(payload).eq('id', evento.id);
    if (error) throw new Error(error.message);
    setAgendaEventos(prev => prev.map(a => a.id === evento.id ? evento : a));
  };

  const deleteAgendaEvent = async (id: string) => {
    await supabase.from('agenda_eventos').delete().eq('id', id);
    setAgendaEventos(prev => prev.filter(a => a.id !== id));
  };

  const syncAgendaEvent = async (origemModulo: 'OBRA' | 'ORCAMENTO' | 'FINANCEIRO', idReferencia: string, eventoData: Partial<AgendaEvento>) => {
    const existente = agendaEventos.find(a => a.origemModulo === origemModulo && a.idReferencia === idReferencia);
    if (existente) {
      // Deleta ou atualiza dependendo se foi desmarcado? O ideal é que se o status for CANCELADO ele cancela.
      // O sync só atualiza. A deleção é tratada no delete do projeto/orçamento.
      await updateAgendaEvent({ ...existente, ...eventoData } as AgendaEvento);
    } else {
      if (!eventoData.titulo || !eventoData.dataInicio || !eventoData.tipoEvento) return;
      await addAgendaEvent({
        id: '',
        origemModulo,
        idReferencia,
        tipoEvento: eventoData.tipoEvento,
        titulo: eventoData.titulo,
        descricao: eventoData.descricao,
        responsavel: eventoData.responsavel,
        setor: eventoData.setor,
        dataInicio: eventoData.dataInicio,
        dataFim: eventoData.dataFim,
        prioridade: eventoData.prioridade || 'MEDIA',
        status: eventoData.status || 'PENDENTE',
        linkInterno: eventoData.linkInterno,
        criadoAutomatico: true,
        eventoCritico: eventoData.eventoCritico || false
      } as AgendaEvento);
    }
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

  // --- NOTIFICACOES E FOLLOW UP ---
  const markNotificationAsRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) console.error('Error marking as read:', error);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const addNotification = async (notification: Omit<AppNotification, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('notifications').insert([notification]).select();
    if (error) console.error('Error adding notification:', error);
    if (data) {
      setNotifications(prev => [data[0], ...prev]);
    }
  };

  const addProposalHistory = async (history: Omit<ProposalHistory, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('proposal_history').insert([history]).select();
    if (error) console.error('Error adding proposal history:', error);
    if (data) {
      setProposalHistory(prev => [data[0], ...prev]);
    }
  };

  // --- CRM / LEADS ---
  const addLead = async (lead: Lead) => {
    const { data, error } = await supabase.from('leads').insert([{
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source,
      notes: lead.notes,
      value: lead.value,
      assigned_to: lead.assignedTo
    }]).select().single();
    if (!error && data) setLeads(prev => [data, ...prev]);
  };

  const updateLead = async (lead: Lead) => {
    await supabase.from('leads').update({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source,
      notes: lead.notes,
      value: lead.value,
      assigned_to: lead.assignedTo,
      last_contact: lead.lastContact
    }).eq('id', lead.id);
    setLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
  };

  const deleteLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const addLeadInteraction = async (interaction: Omit<LeadInteraction, 'id' | 'createdAt'>) => {
    await supabase.from('lead_interactions').insert([{
      lead_id: interaction.leadId,
      type: interaction.type,
      content: interaction.content,
      user_name: interaction.userName
    }]);
  };

  // --- INVENTORY ---
  const addInventoryItem = async (item: InventoryItem) => {
    const { data, error } = await supabase.from('inventory_items').insert([{
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      location: item.location,
      unit_price: item.unitPrice,
      supplier_id: item.supplierId,
      status: item.status
    }]).select().single();
    if (!error && data) setInventoryItems(prev => [...prev, data]);
  };

  const updateInventoryItem = async (item: InventoryItem) => {
    await supabase.from('inventory_items').update({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      location: item.location,
      unit_price: item.unitPrice,
      supplier_id: item.supplierId,
      status: item.status
    }).eq('id', item.id);
    setInventoryItems(prev => prev.map(i => i.id === item.id ? item : i));
  };

  const deleteInventoryItem = async (id: string) => {
    await supabase.from('inventory_items').delete().eq('id', id);
    setInventoryItems(prev => prev.filter(i => i.id !== id));
  };

  const addInventoryMovement = async (movement: Omit<InventoryMovement, 'id' | 'date'>) => {
    const { data, error } = await supabase.from('inventory_movements').insert([{
      item_id: movement.itemId,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      user_name: movement.userName,
      project_id: movement.projectId
    }]).select().single();

    if (!error && data) {
      // Atualizar quantidade no estado local
      setInventoryItems(prev => prev.map(i => {
        if (i.id === movement.itemId) {
          const newQty = movement.type === 'Entrada' ? i.quantity + movement.quantity : i.quantity - movement.quantity;
          return { ...i, quantity: newQty };
        }
        return i;
      }));
    }
  };

  // --- GOALS ---
  const addGoal = async (goal: Goal) => {
    const { data, error } = await supabase.from('goals').insert([{
      id: goal.id,
      title: goal.title,
      target: goal.target,
      current: goal.current,
      type: goal.type,
      deadline: goal.deadline,
      status: goal.status
    }]).select().single();
    if (!error && data) setGoals(prev => [...prev, goal]);
  };

  const updateGoal = async (goal: Goal) => {
    await supabase.from('goals').update({
      title: goal.title,
      target: goal.target,
      current: goal.current,
      type: goal.type,
      deadline: goal.deadline,
      status: goal.status
    }).eq('id', goal.id);
    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  };

  const deleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };
  return (
    <DataContext.Provider value={{
      sinapiDatabase: MOCK_SINAPI_DB,
      companyName, setCompanyName,
      companyLogo, setCompanyLogo,
      companyCNPJ, setCompanyCNPJ,
      companyPhone, setCompanyPhone,
      companyAddress, setCompanyAddress,
      companyEmail, setCompanyEmail,
      clients, addClient, updateClient, deleteClient,
      projects, addProject, updateProject, deleteProject,
      financials, addFinancialRecord, updateFinancialRecord, deleteFinancialRecord,
      services, addService, updateService, deleteService,
      proposals,
      addProposal,
      updateProposal,
      updateProposalStatus,
      deleteProposal,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      teamMembers, addTeamMember, updateTeamMember, deleteTeamMember,
      payments, addPayment, updatePayment, deletePayment,
      users, addUser, updateUser, deleteUser,
      agendaEventos, addAgendaEvent, updateAgendaEvent, deleteAgendaEvent, syncAgendaEvent,
      notifications, markNotificationAsRead, addNotification,
      proposalHistory, addProposalHistory,
      measurements, addMeasurement,
      dailyReports, addDailyReport, updateDailyReport,
      projectTasks, addProjectTask, updateProjectTask, deleteProjectTask,
      projectMilestones, addProjectMilestone, updateProjectMilestone, deleteProjectMilestone,
      leads, addLead, updateLead, deleteLead, addLeadInteraction,
      inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, addInventoryMovement,
      goals, addGoal, updateGoal, deleteGoal,
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
