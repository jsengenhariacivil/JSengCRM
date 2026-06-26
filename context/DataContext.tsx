
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Client, Project, FinancialRecord, Service, Proposal, ProposalItem, ProposalEtapa, SinapiService, Supplier, TeamMember, PaymentRecord, Status, UserData, UserPermissions, AgendaEvento, AppNotification, ProposalHistory, Measurement, DailyReport, ProjectTask, ProjectMilestone, Lead, LeadInteraction, InventoryItem, InventoryMovement, Goal, Contract, PurchaseOrder, SafetyRecord, EngineeringDocument, QualityInspection, ProjectStage, ProjectSubStage, TimePunch } from '../types';

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
  deleteProject: (id: string) => Promise<boolean>;

  financials: FinancialRecord[];
  addFinancialRecord: (record: (Omit<FinancialRecord, 'id'> & { id?: string }) | (Omit<FinancialRecord, 'id'> & { id?: string })[]) => Promise<void>;
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
  deleteProposal: (id: string) => Promise<boolean>;

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
  addMeasurement: (measurement: Omit<Measurement, 'id'> & { id?: string }) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  updateMeasurement: (measurement: Measurement) => Promise<void>;
  dailyReports: DailyReport[];
  addDailyReport: (report: Omit<DailyReport, 'id'> & { id?: string }) => Promise<void>;
  updateDailyReport: (report: DailyReport) => Promise<void>;
  deleteDailyReport: (id: string) => Promise<void>;

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

  // --- NEW MODULES ---
  contracts: Contract[];
  addContract: (contract: Contract) => Promise<void>;
  updateContract: (contract: Contract) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;

  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: PurchaseOrder) => Promise<void>;
  updatePurchaseOrder: (po: PurchaseOrder) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;

  safetyRecords: SafetyRecord[];
  addSafetyRecord: (record: SafetyRecord) => Promise<void>;
  updateSafetyRecord: (record: SafetyRecord) => Promise<void>;
  deleteSafetyRecord: (id: string) => Promise<void>;

  engineeringDocuments: EngineeringDocument[];
  addEngineeringDocument: (doc: EngineeringDocument) => Promise<void>;
  deleteEngineeringDocument: (id: string) => Promise<void>;
  uploadFile: (bucket: string, path: string, file: File) => Promise<string>;

  qualityInspections: QualityInspection[];
  addQualityInspection: (inspection: QualityInspection) => Promise<void>;
  updateQualityInspection: (inspection: QualityInspection) => Promise<void>;
  deleteQualityInspection: (id: string) => Promise<void>;

  loading: boolean;
  refreshData: () => Promise<void>;

  // --- CRONOGRAMA ---
  projectStages: ProjectStage[];
  addProjectStage: (stage: Omit<ProjectStage, 'id'>) => Promise<void>;
  updateProjectStage: (id: string, data: Partial<ProjectStage>) => Promise<void>;
  deleteProjectStage: (id: string) => Promise<void>;
  addProjectSubStage: (subStage: Omit<ProjectSubStage, 'id'>) => Promise<void>;
  updateProjectSubStage: (id: string, data: Partial<ProjectSubStage>) => Promise<void>;
  deleteProjectSubStage: (id: string) => Promise<void>;

  // --- RH PONTO ---
  timePunches: TimePunch[];
  addTimePunch: (punch: Omit<TimePunch, 'id'>) => Promise<void>;
  updateTimePunch: (id: string, data: Partial<TimePunch>) => Promise<void>;
  deleteTimePunch: (id: string) => Promise<void>;
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
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
  const [timePunches, setTimePunches] = useState<TimePunch[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [safetyRecords, setSafetyRecords] = useState<SafetyRecord[]>([]);
  const [engineeringDocuments, setEngineeringDocuments] = useState<EngineeringDocument[]>([]);
  const [qualityInspections, setQualityInspections] = useState<QualityInspection[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar todos os dados
  const refreshData = async () => {
    try {
      setLoading(true);

      const loadAllData = async () => {
        const [
          clientsData, projectsData, financialsData, servicesData,
          proposalsData, suppliersData, teamData, paymentsData, usersData, agendaData,
          notificationsData, proposalHistoryData, leadsData, inventoryData, goalsData,
          contractsData, poData, safetyData, engData, qualityData
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
          supabase.from('goals').select('*'),
          supabase.from('contracts').select('*'),
          supabase.from('purchase_orders').select('*, purchase_order_items(*)'),
          supabase.from('safety_records').select('*'),
          supabase.from('engineering_documents').select('*'),
          supabase.from('quality_inspections').select('*')
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
            projectId: f.project_id,
            parentRecordId: f.parent_record_id,
            installmentNumber: f.installment_number,
            totalInstallments: f.total_installments,
            isRecurring: f.is_recurring
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
          setProposals(proposalsData.data.map(p => {
            const allItems: any[] = p.proposal_items || [];
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

            const etapasMap = new Map();
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
              items: rootItems,
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
            status: t.status,
            gender: t.gender,
            document_cpf: t.document_cpf,
            document_rg: t.document_rg,
            birth_date: t.birth_date,
            admission_date: t.admission_date,
            address: t.address,
            emergency_contact: t.emergency_contact,
            bank_pix: t.bank_pix,
            bank_info: t.bank_info
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
            user_id: n.user_id || null,
            created_at: n.created_at
          })));
        }

        if (proposalHistoryData.data) {
          setProposalHistory(proposalHistoryData.data.map(ph => ({
            id: ph.id,
            proposal_id: ph.proposal_id || null,
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
            value: parseFloat(l.valor) || 0,
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

        if (contractsData.data) {
          setContracts(contractsData.data.map(c => ({
            id: c.id,
            proposalId: c.proposal_id,
            clientId: c.client_id,
            clientName: '', // Will be matched later or fetched with join
            title: c.title,
            value: parseFloat(c.value) || 0,
            startDate: c.start_date,
            endDate: c.end_date,
            status: c.status,
            terms: c.terms,
            createdAt: c.created_at
          })));
        }

        if (poData.data) {
          setPurchaseOrders(poData.data.map(po => ({
            id: po.id,
            supplierId: po.supplier_id,
            supplierName: '', // Link later
            projectId: po.project_id,
            description: po.description,
            totalValue: parseFloat(po.total_value) || 0,
            date: po.date,
            status: po.status,
            createdAt: po.created_at,
            items: po.purchase_order_items?.map((item: any) => ({
              id: item.id,
              purchaseOrderId: item.purchase_order_id,
              description: item.description,
              quantity: parseFloat(item.quantity) || 0,
              unit: item.unit,
              unitPrice: parseFloat(item.unit_price) || 0,
              totalPrice: parseFloat(item.total_price) || 0
            })) || []
          })));
        }

        if (safetyData.data) {
          setSafetyRecords(safetyData.data.map(s => ({
            id: s.id,
            type: s.type,
            title: s.title,
            description: s.description,
            date: s.date,
            responsible: s.responsible,
            status: s.status,
            projectId: s.project_id,
            createdAt: s.created_at
          })));
        }

        if (engData.data) {
          setEngineeringDocuments(engData.data.map(e => ({
            id: e.id,
            projectId: e.project_id,
            title: e.title,
            category: e.category,
            documentType: (e.document_type as any) || 'Link',
            fileUrl: e.file_url,
            version: e.version,
            uploadedBy: e.uploaded_by,
            createdAt: e.created_at
          })));
        }

        if (qualityData.data) {
          setQualityInspections(qualityData.data.map(q => ({
            id: q.id,
            projectId: q.project_id,
            title: q.title,
            description: q.description,
            status: q.status,
            inspector: q.inspector,
            date: q.date,
            notes: q.notes,
            createdAt: q.created_at
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

      // Carregar Cronograma (Stages e SubStages)
      const { data: stagesData } = await supabase.from('project_stages').select('*');
      const { data: subStagesData } = await supabase.from('project_sub_stages').select('*');
      if (stagesData) {
        setProjectStages(stagesData.map(s => {
          const subs = subStagesData?.filter(sub => sub.stage_id === s.id) || [];
          return {
            id: s.id,
            obra_id: s.obra_id || null,
            name: s.name,
            weight: parseFloat(s.weight),
            progress: parseFloat(s.progress),
            startDate: s.start_date,
            endDate: s.end_date,
            value: parseFloat(s.value || 0),
            subStages: subs.map(sub => ({
              id: sub.id,
              stage_id: sub.stage_id || null,
              name: sub.name,
              progress: parseFloat(sub.progress),
              weight: parseFloat(sub.weight)
            }))
          };
        }));
      }

      // Carregar Ponto RH (Time Punches)
      const { data: punchesData } = await supabase.from('time_punches').select('*');
      if (punchesData) {
        setTimePunches(punchesData.map(p => ({
          id: p.id,
          employee_id: p.employee_id || null,
          date: p.date,
          entry_time: p.entry_time,
          exit_time: p.exit_time,
          hours_worked: parseFloat(p.hours_worked),
          value_paid: parseFloat(p.value_paid),
          note: p.note
        })));
      }

      // Carregar Movimentações de Estoque
      const { data: movementsData } = await supabase.from('inventory_movements').select('*').order('date', { ascending: false });
      if (movementsData) {
        setInventoryMovements(movementsData.map(m => ({
          id: m.id,
          itemId: m.item_id,
          type: m.type as 'IN' | 'OUT',
          quantity: parseFloat(m.quantity),
          date: m.date,
          projectId: m.project_id,
          responsible: m.responsible,
          notes: m.notes
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
        client_id: project.clientId || null,
        address: project.address,
        status: project.status,
        start_date: project.startDate || new Date().toISOString().split('T')[0],
        end_date: project.endDate || project.startDate || new Date().toISOString().split('T')[0],
        budget: project.budget,
        progress: project.progress,
        proposal_id: project.proposalId || null
      }]).select().single();

      if (error) {
        console.error('Error adding project:', error);
        throw new Error(`Erro ao salvar projeto: ${error.message}`);
      }

      if (data) {
        const newProject = { ...project, id: data.id };
        setProjects(prev => [...prev, newProject]);

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
      client_id: project.clientId || null,
      address: project.address,
      status: project.status,
      start_date: project.startDate || new Date().toISOString().split('T')[0],
      end_date: project.endDate || project.startDate || new Date().toISOString().split('T')[0],
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
    // REGRA DE SEGURANÇA: Bloquear se houver medições ou RDOs
    const hasMeasurements = measurements.some(m => m.projectId === id);
    const hasRdos = dailyReports.some(r => r.projectId === id);

    if (hasMeasurements || hasRdos) {
      alert("Não é possível excluir esta obra pois ela já possui medições ou RDOs lançados. A obra está em execução.");
      return false;
    }

    try {
      // 1. Limpar registros financeiros vinculados
      await supabase.from('financial_records').delete().eq('project_id', id);
      setFinancials(prev => prev.filter(f => f.projectId !== id));

      // 2. Limpar outras dependências
      await supabase.from('project_tasks').delete().eq('project_id', id);
      setProjectTasks(prev => prev.filter(t => t.projectId !== id));

      await supabase.from('project_milestones').delete().eq('project_id', id);
      setProjectMilestones(prev => prev.filter(m => m.projectId !== id));

      // 3. Excluir o projeto
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== id));

      // 4. Remover eventos da agenda vinculados
      const eventosVinculados = agendaEventos.filter(a => a.origemModulo === 'OBRA' && a.idReferencia === id);
      for (const ev of eventosVinculados) {
        await deleteAgendaEvent(ev.id).catch(console.error);
      }

      return true;
    } catch (err: any) {
      console.error('Erro ao excluir projeto:', err);
      alert('Erro ao excluir projeto: ' + err.message);
      return false;
    }
  };

  // --- FINANCIAL RECORDS ---
  const addFinancialRecord = async (record: (Omit<FinancialRecord, 'id'> & { id?: string }) | (Omit<FinancialRecord, 'id'> & { id?: string })[]) => {
    const records = Array.isArray(record) ? record : [record];
    const toInsert = records.map(r => {
      const data: any = {
        type: r.type,
        description: r.description,
        amount: r.amount,
        date: r.date,
        status: r.status,
        category: r.category,
        project_id: r.projectId || null,
        parent_record_id: r.parentRecordId || null,
        installment_number: r.installmentNumber,
        total_installments: r.totalInstallments,
        is_recurring: r.isRecurring,
        financial_entity: r.financial_entity || 'PJ'
      };
      
      return data;
    });

    // Automação de Pró-labore/Retirada
    const automatedRecords: any[] = [];
    records.forEach(r => {
      const isWithdrawal = r.type === 'Despesa' && 
                          (r.category === 'Pró-labore' || r.category === 'Retirada') && 
                          (r.financial_entity === 'PJ' || !r.financial_entity);
      
      if (isWithdrawal) {
        automatedRecords.push({
          type: 'Receita',
          description: `[Automação] Pró-labore/Retirada: ${r.description}`,
          amount: r.amount,
          date: r.date,
          status: r.status,
          category: 'Pessoal',
          financial_entity: 'Pessoal'
        });
      }
    });

    if (automatedRecords.length > 0) {
      toInsert.push(...automatedRecords);
    }

    const { data, error } = await supabase.from('financial_records').insert(toInsert).select();

    if (!error && data) {
      const insertedRecords: FinancialRecord[] = data.map(d => ({
        id: d.id,
        type: d.type as 'Receita' | 'Despesa',
        description: d.description,
        amount: parseFloat(d.amount),
        date: d.date,
        status: d.status as Status,
        category: d.category,
        projectId: d.project_id,
        parentRecordId: d.parent_record_id,
        installmentNumber: d.installment_number,
        totalInstallments: d.total_installments,
        isRecurring: d.is_recurring,
        financial_entity: d.financial_entity
      }));
      setFinancials(prev => [...insertedRecords, ...prev]);
    } else if (error) {
      console.error('Error adding financial record:', error);
      throw error;
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
      project_id: record.projectId || null,
      parent_record_id: record.parentRecordId || null,
      installment_number: record.installmentNumber,
      total_installments: record.totalInstallments,
      is_recurring: record.isRecurring,
      financial_entity: record.financial_entity || 'PJ'
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
      client_id: proposal.clientId || null,
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
            proposal_id: proposalData.id || null,
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
                  proposal_id: proposalData.id || null,
                  etapa_id: etapaData.id || null,
                  parent_id: parentId || null,
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
          proposal_id: proposalData.id || null,
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
        }
      }

      // --- AUTOMATION: Lead Creation/Update ---
      try {
        const client = clients.find(c => c.id === proposal.clientId);
        const searchName = (proposal.clientName || client?.name || '').trim().toLowerCase();
        const searchEmail = (client?.email || '').trim().toLowerCase();
        
        const existingLead = leads.find(l => 
          l.name.trim().toLowerCase() === searchName || 
          (searchEmail && l.email?.trim().toLowerCase() === searchEmail)
        );

        console.log(`[DEBUG Lead Auto] Buscando lead para: ${searchName} / ${searchEmail}. Encontrado: ${existingLead ? 'SIM' : 'NÃO'}`);

        if (existingLead) {
          if (existingLead.status !== 'Convertido') {
            await updateLead({
              ...existingLead,
              status: 'Negociação',
              value: proposal.total,
              lastContact: new Date().toISOString()
            });
          }
        } else {
          await addLead({
            id: '',
            name: proposal.clientName || client?.name || 'Cliente Novo',
            email: client?.email || '',
            phone: client?.phone || '',
            status: 'Negociação',
            source: 'Sistema (Proposta)',
            notes: `Gerado automaticamente a partir da Proposta #${proposalData.id.substring(0, 8)}`,
            value: proposal.total,
            createdAt: new Date().toISOString()
          });
        }
      } catch (leadErr) {
        console.error('Erro na automação de lead ao salvar proposta:', leadErr);
      }
    }
  };

  const updateProposalStatus = async (id: string, status: Status) => {
    await supabase.from('proposals').update({ status }).eq('id', id);
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));

    try {
      // Buscar dados da proposta e cliente
      const { data: proposal, error: fetchError } = await supabase
        .from('proposals')
        .select('*, clients(name)')
        .eq('id', id)
        .single();

      if (fetchError || !proposal) return;

      const clientName = proposal.clients?.name || 'Cliente';
      const safeTotal = proposal.total || 0;
      const jaExisteObra = projects.find(p => p.proposalId === id);

      if (status === Status.APPROVED) {
        if (!jaExisteObra) {
          const projectStartDate = proposal.date || new Date().toISOString().split('T')[0];
          await addProject({
            id: '',
            title: `Obra: ${clientName} - #${id.substring(0, 8)}`,
            clientId: proposal.client_id,
            clientName: clientName,
            address: '',
            status: Status.PENDING,
            startDate: projectStartDate,
            endDate: projectStartDate,
            budget: safeTotal,
            progress: 0,
            proposalId: id
          });
        } else {
          // Atualizar obra existente se o valor ou status mudar
          await updateProject({
            ...jaExisteObra,
            budget: safeTotal,
            title: `Obra: ${clientName} - #${id.substring(0, 8)}`
          });
        }

        // Notificação
        await addNotification({
          title: 'Proposta Aprovada! 🎉',
          message: `Proposta #${id.substring(0, 8)} de ${clientName} aprovada. Valor: R$ ${safeTotal.toLocaleString('pt-BR')}`,
          type: 'success',
          is_read: false
        }).catch(console.error);

        // --- AUTOMATION: Lead Conversion ---
        const existingLead = leads.find(l => l.name.toLowerCase() === clientName.toLowerCase());
        if (existingLead && existingLead.status !== 'Convertido') {
          await updateLead({
            ...existingLead,
            status: 'Convertido',
            lastContact: new Date().toISOString()
          });
        }

        // --- AUTOMATION: Proposal PDF Registration ---
        // Buscamos o projeto recém criado para vincular o documento
        const { data: newProj } = await supabase
          .from('projects')
          .select('id')
          .eq('proposalId', id)
          .single();

        if (newProj) {
          await addEngineeringDocument({
            id: '',
            projectId: newProj.id,
            title: `Proposta Comercial - #${id.substring(0, 8)}`,
            category: 'Memorial',
            documentType: 'PDF',
            fileUrl: `documents/proposals/proposta_${id}.pdf`,
            version: '1.0',
            uploadedBy: 'Sistema',
            createdAt: new Date().toISOString()
          });
        }
      } else if (status === Status.REJECTED || status === Status.PENDING) {
        // Se voltar para pendente ou cancelado, ajustar obra e financeiro
        if (jaExisteObra) {
          await updateProject({
            ...jaExisteObra,
            budget: 0,
            status: status === Status.REJECTED ? Status.REJECTED : Status.PENDING
          });
        }
      }
    } catch (err) {
      console.error('Erro na sincronização de proposta:', err);
    }
  };

  const updateProposal = async (proposal: Proposal) => {
    if (!proposal.id) return;

    // Atualiza cabeçalho
    const { error: proposalError } = await supabase.from('proposals').update({
      client_id: proposal.clientId || null,
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
          proposal_id: proposal.id || null,
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
                proposal_id: proposal.id || null,
                etapa_id: etapaData.id || null,
                parent_id: parentId || null,
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

    // --- AUTOMATION: Lead Creation/Update ---
    try {
      const client = clients.find(c => c.id === proposal.clientId);
      const searchName = (proposal.clientName || client?.name || '').trim().toLowerCase();
      const searchEmail = (client?.email || '').trim().toLowerCase();
      
      const existingLead = leads.find(l => 
        l.name.trim().toLowerCase() === searchName || 
        (searchEmail && l.email?.trim().toLowerCase() === searchEmail)
      );

      console.log(`[DEBUG Lead Auto Update] Buscando lead para: ${searchName}. Encontrado: ${existingLead ? 'SIM' : 'NÃO'}`);

      if (existingLead) {
        if (existingLead.status !== 'Convertido') {
          await updateLead({
            ...existingLead,
            status: 'Negociação',
            value: proposal.total,
            lastContact: new Date().toISOString()
          });
        }
      } else {
        await addLead({
          id: '',
          name: proposal.clientName || client?.name || 'Cliente Novo',
          email: client?.email || '',
          phone: client?.phone || '',
          status: proposal.status === Status.APPROVED ? 'Convertido' : 'Negociação',
          source: 'Sistema (Proposta)',
          notes: `Gerado automaticamente a partir da edição da Proposta #${proposal.id?.substring(0, 8)}`,
          value: proposal.total,
          createdAt: new Date().toISOString()
        });
      }
    } catch (leadErr) {
      console.error('Erro na automação de lead ao atualizar proposta:', leadErr);
    }

    // Integração Financeira, Obras e Central de Notificações
    if (proposal.status === Status.APPROVED) {
      const safeTotal = proposal.total || 0;
      const clientName = proposal.clientName || 'Cliente';

      // Dispara Notificação Global
      await addNotification({
        title: 'Proposta Atualizada ✅',
        message: `Proposta de ${clientName} atualizada. Novo Valor: R$ ${safeTotal.toLocaleString('pt-BR')}`,
        type: 'info',
        is_read: false
      }).catch(console.error);

      // Sincronizar com Obra
      const obraVinculada = projects.find(p => p.proposalId === proposal.id);
      if (obraVinculada) {
        await updateProject({
          ...obraVinculada,
          budget: safeTotal,
          title: `Obra: ${clientName} - #${proposal.id.substring(0, 8)}`
        });
      }
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      // 1. Localizar obra vinculada
      const linkedProject = projects.find(p => p.proposalId === id);
      
      if (linkedProject) {
        // Tentar excluir a obra primeiro (respeitando a regra de medição/RDO)
        const success = await deleteProject(linkedProject.id);
        if (!success) return false; 
      } else {
        // Se não houver projeto, apenas desvincular qualquer projeto que tenha esse proposalId (segurança adicional)
        await supabase.from('projects').update({ proposal_id: null } as any).eq('proposal_id', id);
      }
      
      // 2. Apagar a proposta
      const { error } = await supabase.from('proposals').delete().eq('id', id);
      
      if (!error) {
        setProposals(prev => prev.filter(p => p.id !== id));
        // Apagar da Agenda também, se existir
        supabase.from('agenda_eventos').delete().eq('id_referencia', id).then();
        return true;
      } else {
        throw error;
      }
    } catch (error: any) {
      console.error('Erro ao excluir proposta:', error);
      alert('Erro ao excluir proposta: ' + (error.message || error));
      return false;
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
      status: member.status,
      gender: member.gender,
      document_cpf: member.document_cpf,
      document_rg: member.document_rg,
      birth_date: member.birth_date,
      admission_date: member.admission_date,
      address: member.address,
      emergency_contact: member.emergency_contact,
      bank_pix: member.bank_pix,
      bank_info: member.bank_info
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
      status: member.status,
      gender: member.gender,
      document_cpf: member.document_cpf,
      document_rg: member.document_rg,
      birth_date: member.birth_date,
      admission_date: member.admission_date,
      address: member.address,
      emergency_contact: member.emergency_contact,
      bank_pix: member.bank_pix,
      bank_info: member.bank_info
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
  const addMeasurement = async (measurement: Omit<Measurement, 'id'> & { id?: string }) => {
    console.log('[DEBUG v2.1] addMeasurement iniciado');
    try {
      const { data, error } = await supabase.from('measurements').insert([{
        project_id: measurement.projectId || null,
        description: measurement.description,
        date: measurement.date,
        percentage: measurement.percentage,
        value: measurement.value,
        status: measurement.status,
        photos: measurement.photos
      }]).select().single();

      if (error) {
        console.error('Erro ao adicionar medição (Supabase):', error.message);
        throw new Error(`Erro no banco de dados: ${error.message}`);
      }

      if (data) {
        setMeasurements(prev => [{ ...measurement, id: data.id }, ...prev]);

        // Recalcular progresso da obra somando todas as medições
        const updatedMeasurements = [{ ...measurement, id: data.id }, ...measurements];
        const totalProgress = Math.min(100, updatedMeasurements
          .filter(m => m.projectId === measurement.projectId)
          .reduce((sum, m) => sum + m.percentage, 0));

        const project = projects.find(p => p.id === measurement.projectId);
        if (project) {
          await updateProject({ ...project, progress: totalProgress });
        }

        // Adicionar registro financeiro (Receita) vinculada à medição via tag na descrição
        console.log(`Criando registro financeiro para medição ${data.id} no valor de R$ ${measurement.value}`);
        await addFinancialRecord({
          type: 'Receita',
          description: `Medição: ${measurement.description} - Obra: ${project?.title || measurement.projectId} [MID:${data.id}]`,
          amount: measurement.value,
          date: measurement.date,
          status: measurement.status,
          category: 'Obra',
          projectId: measurement.projectId
        });
      }
    } catch (err: any) {
      console.error('Falha crítica em addMeasurement:', err);
      throw err; // Repassa para o modal poder tratar
    }
  };

  const updateMeasurement = async (measurement: Measurement) => {
    const oldMeasurement = measurements.find(m => m.id === measurement.id);
    const { error } = await supabase.from('measurements').update({
      description: measurement.description,
      date: measurement.date,
      percentage: measurement.percentage,
      value: measurement.value,
      status: measurement.status,
      photos: measurement.photos
    }).eq('id', measurement.id);

    if (error) {
      console.error('Erro ao atualizar medição:', error.message);
      return;
    }

    if (!error) {
      setMeasurements(prev => prev.map(m => m.id === measurement.id ? measurement : m));

      // Recalcular progresso da obra somando todas as medições
      const updatedMeasurements = measurements.map(m => m.id === measurement.id ? measurement : m);
      const totalProgress = Math.min(100, updatedMeasurements
        .filter(m => m.projectId === measurement.projectId)
        .reduce((sum, m) => sum + m.percentage, 0));

      const project = projects.find(p => p.id === measurement.projectId);
      if (project) {
        await updateProject({ ...project, progress: totalProgress });
      }

      // Atualizar registro financeiro correspondente localizando pela tag [MID:id]
      try {
        const { data: finData } = await supabase
          .from('financial_records')
          .select('id')
          .ilike('description', `%[MID:${measurement.id}]%`)
          .maybeSingle();

        if (finData) {
          await updateFinancialRecord({
            id: finData.id,
            type: 'Receita',
            description: `Medição: ${measurement.description} - Obra: ${projects.find(p => p.id === measurement.projectId)?.title || measurement.projectId} [MID:${measurement.id}]`,
            amount: measurement.value,
            date: measurement.date,
            status: measurement.status,
            category: 'Obra',
            projectId: measurement.projectId
          });
        }
      } catch (err) {
        console.error('Erro ao sincronizar financeiro da medição:', err);
      }
    }
  };

  const deleteMeasurement = async (id: string) => {
    const measurement = measurements.find(m => m.id === id);
    const { error } = await supabase.from('measurements').delete().eq('id', id);

    if (!error && measurement) {
      // Atualizar estado local IMEDIATAMENTE para os cálculos subsequentes
      const newMeasurements = measurements.filter(m => m.id !== id);
      setMeasurements(newMeasurements);

      // Recalcular progresso da obra com a lista já filtrada
      const totalProgress = Math.min(100, newMeasurements
        .filter(m => m.projectId === measurement.projectId)
        .reduce((sum, m) => sum + m.percentage, 0));

      const project = projects.find(p => p.id === measurement.projectId);
      if (project) {
        await updateProject({ ...project, progress: totalProgress });
      }

      // Remover registro financeiro correspondente localizando pela tag [MID:id]
      await supabase.from('financial_records').delete().ilike('description', `%[MID:${id}]%`);
      setFinancials(prev => prev.filter(f => !f.description.includes(`[MID:${id}]`)));
    } else if (error) {
      console.error('Erro ao excluir medição:', error.message);
    }
  };

  // --- DAILY REPORTS ---
  const addDailyReport = async (report: Omit<DailyReport, 'id'> & { id?: string }) => {
    console.log('[DEBUG v2.1] addDailyReport iniciado');
    const { data, error } = await supabase.from('daily_reports').insert([{
      project_id: report.projectId || null,
      date: report.date,
      weather_morning: report.weatherMorning,
      weather_afternoon: report.weatherAfternoon,
      labor_total: report.laborTotal,
      equipment_notes: report.equipmentNotes,
      activities_notes: report.activitiesNotes,
      occurrences_notes: report.occurrencesNotes,
      photos: report.photos
    }]).select().single();

    if (error) {
      console.error('Erro ao adicionar RDO:', error.message);
      return;
    }

    if (!error && data) {
      setDailyReports(prev => [{ ...report, id: data.id }, ...prev]);
    }
  };

  const updateDailyReport = async (report: DailyReport) => {
    const { error } = await supabase.from('daily_reports').update({
      date: report.date,
      weather_morning: report.weatherMorning,
      weather_afternoon: report.weatherAfternoon,
      labor_total: report.laborTotal,
      equipment_notes: report.equipmentNotes,
      activities_notes: report.activitiesNotes,
      occurrences_notes: report.occurrencesNotes,
      photos: report.photos
    }).eq('id', report.id);

    if (error) {
      console.error('Erro ao atualizar RDO:', error.message);
      return;
    }

    setDailyReports(prev => prev.map(r => r.id === report.id ? report : r));
  };

  const deleteDailyReport = async (id: string) => {
    const { error } = await supabase.from('daily_reports').delete().eq('id', id);
    if (!error) {
      setDailyReports(prev => prev.filter(r => r.id !== id));
    }
  };

  // --- PROJECT TASKS ---
  const addProjectTask = async (task: ProjectTask) => {
    const { data, error } = await supabase.from('project_tasks').insert([{
      project_id: task.projectId || null,
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
      project_id: milestone.projectId || null,
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
    const leadToInsert = {
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source,
      notes: lead.notes,
      valor: isNaN(lead.value as number) ? 0 : lead.value,
      ...(lead.assignedTo ? { assigned_to: lead.assignedTo } : {})
    };

    const { data, error } = await supabase.from('leads').insert([leadToInsert]).select().single();

    if (error) {
      console.error('Erro ao adicionar lead:', error);
      throw new Error(error.message);
    }

    if (data) {
      const mappedLead: Lead = {
        id: data.id,
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        status: data.status,
        source: data.source,
        notes: data.notes,
        value: parseFloat(data.valor) || 0,
        assignedTo: data.assigned_to,
        createdAt: data.created_at,
        lastContact: data.last_contact
      };
      setLeads(prev => [mappedLead, ...prev]);
    }
  };

  const updateLead = async (lead: Lead) => {
    const updateData = {
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source,
      notes: lead.notes,
      valor: isNaN(lead.value as number) ? 0 : lead.value,
      ...(lead.assignedTo ? { assigned_to: lead.assignedTo } : {}),
      last_contact: new Date().toISOString()
    };

    const oldStatus = leads.find(l => l.id === lead.id)?.status;
    const { error } = await supabase.from('leads').update(updateData).eq('id', lead.id);

    if (error) {
      console.error('Erro ao atualizar lead:', error);
      throw new Error(error.message);
    }

    setLeads(prev => prev.map(l => l.id === lead.id ? { ...lead, lastContact: new Date().toISOString() } : l));

    // --- AUTOMATION: Lead to Project ---
    if (lead.status === 'Convertido' && oldStatus !== 'Convertido') {
      // Check if project already exists for this lead (by name or linked previously)
      const alreadyHasProject = projects.some(p => p.clientName.toLowerCase() === lead.name.toLowerCase());
      if (!alreadyHasProject) {
        try {
          await addProject({
            id: '',
            title: `Obra: ${lead.name}${lead.company ? ` (${lead.company})` : ''}`,
            clientId: '',
            clientName: lead.name,
            address: '',
            status: Status.PENDING,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            budget: lead.value || 0,
            progress: 0
          });
        } catch (projErr) {
          console.error('Erro ao criar obra automática a partir de lead:', projErr);
        }
      }
    }
  };

  const deleteLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const addLeadInteraction = async (interaction: Omit<LeadInteraction, 'id' | 'createdAt'>) => {
    await supabase.from('lead_interactions').insert([{
      lead_id: interaction.leadId || null,
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
      location: item.location || '',
      unit_price: item.unitPrice,
      supplier_id: item.supplierId || null,
      status: item.status
    }]).select().single();

    if (error) {
      console.error('Erro detalhado ao cadastrar no almoxarifado:', error.message, error.details, error.hint);
      throw new Error(error.message || 'Erro ao cadastrar item no almoxarifado.');
    }

    if (data) {
      const mapped: InventoryItem = {
        id: data.id,
        name: data.name,
        category: data.category,
        unit: data.unit,
        quantity: data.quantity,
        minQuantity: data.min_quantity,
        location: data.location,
        unitPrice: data.unit_price,
        supplierId: data.supplier_id,
        status: data.status,
        lastRestocked: data.last_restocked
      };
      setInventoryItems(prev => [...prev, mapped]);
    }
  };

  const updateInventoryItem = async (item: InventoryItem) => {
    const { error } = await supabase.from('inventory_items').update({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      location: item.location,
      unit_price: item.unitPrice,
      supplier_id: item.supplierId || null,
      status: item.status
    }).eq('id', item.id);
    if (error) {
      console.error('Erro detalhado ao atualizar almoxarifado:', error.message);
      throw new Error(error.message);
    }
    setInventoryItems(prev => prev.map(i => i.id === item.id ? item : i));
  };

  const deleteInventoryItem = async (id: string) => {
    await supabase.from('inventory_items').delete().eq('id', id);
    setInventoryItems(prev => prev.filter(i => i.id !== id));
  };

  const addInventoryMovement = async (movement: Omit<InventoryMovement, 'id'>) => {
    const { data, error } = await supabase.from('inventory_movements').insert([{
      item_id: movement.itemId || null,
      type: movement.type,
      quantity: movement.quantity,
      date: movement.date,
      project_id: movement.projectId || null,
      responsible: movement.responsible,
      notes: movement.notes
    }]).select().single();

    if (error) {
      console.error('Error adding inventory movement:', error);
      throw new Error(`Erro ao salvar movimentação: ${error.message}`);
    }

    if (data) {
      setInventoryMovements(prev => [{
        id: data.id,
        itemId: data.item_id,
        type: data.type as 'IN' | 'OUT',
        quantity: parseFloat(data.quantity),
        date: data.date,
        projectId: data.project_id,
        responsible: data.responsible,
        notes: data.notes
      }, ...prev]);

      // Atualizar quantidade no estado local
      setInventoryItems(prev => prev.map(i => {
        if (i.id === movement.itemId) {
          const newQty = movement.type === 'IN' ? i.quantity + movement.quantity : i.quantity - movement.quantity;
          return { ...i, quantity: newQty };
        }
        return i;
      }));
    }
  };

  // --- GOALS ---
  const addGoal = async (goal: Goal) => {
    const { data, error } = await supabase.from('goals').insert([{
      title: goal.title,
      target: goal.target,
      current: goal.current,
      type: goal.type,
      deadline: goal.deadline,
      status: goal.status
    }]).select().single();

    if (error) {
      console.error('Erro detalhado ao cadastrar meta:', error.message, error.details, error.hint);
      throw new Error(error.message || 'Erro ao cadastrar meta no banco de dados.');
    }

    if (data) {
      const mapped: Goal = {
        id: data.id,
        title: data.title,
        target: data.target,
        current: data.current,
        type: data.type,
        deadline: data.deadline,
        status: data.status
      };
      setGoals(prev => [...prev, mapped]);
    }
  };

  const updateGoal = async (goal: Goal) => {
    const { error } = await supabase.from('goals').update({
      title: goal.title,
      target: goal.target,
      current: goal.current,
      type: goal.type,
      deadline: goal.deadline,
      status: goal.status
    }).eq('id', goal.id);

    if (error) {
      console.error('Erro detalhado ao atualizar meta:', error.message, error.details, error.hint);
      throw new Error(error.message || 'Erro ao atualizar meta no banco de dados.');
    }

    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  };

  const deleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // --- CONTRACTS ---
  const addContract = async (contract: Contract) => {
    try {
      const proposalId = contract.proposalId && contract.proposalId.trim() !== "" ? contract.proposalId : null;
      const clientId = contract.clientId && contract.clientId.trim() !== "" ? contract.clientId : null;

      const { data, error } = await supabase.from('contracts').insert([{
        proposal_id: proposalId || null,
        client_id: clientId || null,
        title: contract.title,
        value: contract.value,
        start_date: contract.startDate,
        end_date: contract.endDate,
        status: contract.status,
        terms: contract.terms
      }]).select().single();

      if (error) {
        console.error('Erro ao salvar contrato no Supabase:', error);
        throw new Error(`Erro ao salvar contrato: ${error.message}`);
      }

      if (data) {
        setContracts(prev => [{
          ...contract,
          id: data.id,
          createdAt: data.created_at
        }, ...prev]);
      }
    } catch (err) {
      console.error('Falha inesperada em addContract:', err);
      throw err;
    }
  };

  const updateContract = async (contract: Contract) => {
    try {
      const proposalId = contract.proposalId && contract.proposalId.trim() !== "" ? contract.proposalId : null;
      const clientId = contract.clientId && contract.clientId.trim() !== "" ? contract.clientId : null;

      const { error } = await supabase.from('contracts').update({
        proposal_id: proposalId || null,
        client_id: clientId || null,
        title: contract.title,
        value: contract.value,
        start_date: contract.startDate,
        end_date: contract.endDate,
        status: contract.status,
        terms: contract.terms
      }).eq('id', contract.id);

      if (error) {
        console.error('Erro ao atualizar contrato:', error);
        throw error;
      }

      setContracts(prev => prev.map(c => c.id === contract.id ? contract : c));
    } catch (err) {
      console.error('Erro em updateContract:', err);
      throw err;
    }
  };

  const deleteContract = async (id: string) => {
    await supabase.from('contracts').delete().eq('id', id);
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  // --- PURCHASE ORDERS ---
  const addPurchaseOrder = async (po: PurchaseOrder) => {
    try {
      const projectId = po.projectId && po.projectId.trim() !== "" ? po.projectId : null;
      const supplierId = po.supplierId && po.supplierId.trim() !== "" ? po.supplierId : null;

      const { data, error } = await supabase.from('purchase_orders').insert([{
        supplier_id: supplierId || null,
        project_id: projectId || null,
        description: po.description,
        total_value: po.totalValue,
        date: po.date,
        status: po.status
      }]).select().single();

      if (error) {
        console.error('Supabase error (purchase_orders):', error);
        throw error;
      }

      if (data) {
        if (po.items && po.items.length > 0) {
          const itemsToInsert = po.items.map(item => ({
            purchase_order_id: data.id || null,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unitPrice,
            total_price: item.totalPrice
          }));
          const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsToInsert);
          if (itemsError) {
            console.error('Supabase error (purchase_order_items):', itemsError);
          }
        }
        setPurchaseOrders(prev => [{ ...po, id: data.id, createdAt: data.created_at }, ...prev]);
      }
    } catch (err) {
      console.error('Catch error in addPurchaseOrder:', err);
      throw err;
    }
  };

  const updatePurchaseOrder = async (po: PurchaseOrder) => {
    try {
      const projectId = po.projectId && po.projectId.trim() !== "" ? po.projectId : null;
      const supplierId = po.supplierId && po.supplierId.trim() !== "" ? po.supplierId : null;

      const { error } = await supabase.from('purchase_orders').update({
        status: po.status,
        description: po.description,
        project_id: projectId || null,
        supplier_id: supplierId || null,
        total_value: po.totalValue,
        date: po.date
      }).eq('id', po.id);

      if (error) throw error;

      setPurchaseOrders(prev => prev.map(p => p.id === po.id ? po : p));
    } catch (err) {
      console.error('Erro em updatePurchaseOrder:', err);
      throw err;
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    await supabase.from('purchase_orders').delete().eq('id', id);
    setPurchaseOrders(prev => prev.filter(p => p.id !== id));
  };

  // --- SAFETY RECORDS ---
  const addSafetyRecord = async (record: SafetyRecord) => {
    try {
      // Garantir que projectId vazio seja enviado como NULL para o Postgres (UUID)
      const projectId = record.projectId && record.projectId.trim() !== "" ? record.projectId : null;

      const { data, error } = await supabase.from('safety_records').insert([{
        type: record.type,
        title: record.title,
        description: record.description,
        date: record.date,
        responsible: record.responsible,
        status: record.status,
        project_id: projectId || null
      }]).select().single();

      if (error) {
        console.error('Supabase error (safety_records):', error);
        throw error;
      }

      if (data) {
        setSafetyRecords(prev => [{ ...record, id: data.id, createdAt: data.created_at }, ...prev]);
      }
    } catch (err) {
      console.error('Catch error in addSafetyRecord:', err);
      throw err;
    }
  };

  const updateSafetyRecord = async (record: SafetyRecord) => {
    try {
      const projectId = record.projectId && record.projectId.trim() !== "" ? record.projectId : null;

      const { error } = await supabase.from('safety_records').update({
        type: record.type,
        title: record.title,
        description: record.description,
        date: record.date,
        status: record.status,
        responsible: record.responsible,
        project_id: projectId || null
      }).eq('id', record.id);

      if (error) {
        console.error('Supabase error (update safety_records):', error);
        throw error;
      }

      setSafetyRecords(prev => prev.map(s => s.id === record.id ? record : s));
    } catch (err) {
      console.error('Catch error in updateSafetyRecord:', err);
      throw err;
    }
  };

  const deleteSafetyRecord = async (id: string) => {
    await supabase.from('safety_records').delete().eq('id', id);
    setSafetyRecords(prev => prev.filter(s => s.id !== id));
  };

  // --- ENGINEERING DOCUMENTS ---
  const uploadFile = async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  };

  const addEngineeringDocument = async (doc: EngineeringDocument) => {
    const projectId = doc.projectId && doc.projectId.trim() !== "" ? doc.projectId : null;

    const { data, error } = await supabase.from('engineering_documents').insert([{
      project_id: projectId || null,
      title: doc.title,
      category: doc.category,
      document_type: doc.documentType || 'Link',
      file_url: doc.fileUrl,
      version: doc.version,
      uploaded_by: doc.uploadedBy
    }]).select().single();

    if (error) {
      console.error("Erro ao inserir documento:", error);
      throw error;
    }

    if (!error && data) {
      setEngineeringDocuments(prev => [{
        ...doc,
        id: data.id,
        documentType: doc.documentType || 'Link',
        createdAt: data.created_at
      }, ...prev]);
    }
  };

  const deleteEngineeringDocument = async (id: string) => {
    await supabase.from('engineering_documents').delete().eq('id', id);
    setEngineeringDocuments(prev => prev.filter(d => d.id !== id));
  };

  // --- QUALITY INSPECTIONS ---
  const addQualityInspection = async (inspection: QualityInspection) => {
    try {
      const projectId = inspection.projectId && inspection.projectId.trim() !== "" ? inspection.projectId : null;

      const { data, error } = await supabase.from('quality_inspections').insert([{
        project_id: projectId || null,
        title: inspection.title,
        description: inspection.description,
        status: inspection.status,
        inspector: inspection.inspector,
        date: inspection.date,
        notes: inspection.notes
      }]).select().single();

      if (error) {
        console.error('Erro ao salvar inspeção no Supabase:', error);
        throw new Error(`Erro ao salvar inspeção: ${error.message}`);
      }

      if (data) {
        setQualityInspections(prev => [{
          ...inspection,
          id: data.id,
          createdAt: data.created_at
        }, ...prev]);
      }
    } catch (err) {
      console.error('Falha inesperada em addQualityInspection:', err);
      throw err;
    }
  };

  const updateQualityInspection = async (inspection: QualityInspection) => {
    try {
      const projectId = inspection.projectId && inspection.projectId.trim() !== "" ? inspection.projectId : null;

      const { error } = await supabase.from('quality_inspections').update({
        project_id: projectId || null,
        title: inspection.title,
        description: inspection.description,
        status: inspection.status,
        inspector: inspection.inspector,
        date: inspection.date,
        notes: inspection.notes
      }).eq('id', inspection.id);

      if (error) {
        console.error('Erro ao atualizar inspeção no Supabase:', error);
        throw new Error(`Erro ao atualizar inspeção: ${error.message}`);
      }

      setQualityInspections(prev => prev.map(q => q.id === inspection.id ? inspection : q));
    } catch (err) {
      console.error('Falha inesperada em updateQualityInspection:', err);
      throw err;
    }
  };

  const deleteQualityInspection = async (id: string) => {
    await supabase.from('quality_inspections').delete().eq('id', id);
    setQualityInspections(prev => prev.filter(q => q.id !== id));
  };

  // --- CRONOGRAMA ---
  const addProjectStage = async (stage: Omit<ProjectStage, 'id'>) => {
    const payload = {
      obra_id: stage.obra_id || null,
      name: stage.name,
      weight: stage.weight,
      progress: stage.progress,
      start_date: stage.startDate,
      end_date: stage.endDate,
      value: stage.value
    };
    const { data, error } = await supabase.from('project_stages').insert([payload]).select().single();
    if (error) {
      console.error('Erro addProjectStage:', error);
      throw error;
    }
    if (data) {
      setProjectStages(prev => [...prev, { ...stage, id: data.id }]);
    }
  };
  const updateProjectStage = async (id: string, stageData: Partial<ProjectStage>) => {
    const payload: any = { ...stageData };
    if (payload.startDate) { payload.start_date = payload.startDate; delete payload.startDate; }
    if (payload.endDate) { payload.end_date = payload.endDate; delete payload.endDate; }

    const { error } = await supabase.from('project_stages').update(payload).eq('id', id);
    if (error) {
      console.error('Erro updateProjectStage:', error);
      throw error;
    }
    setProjectStages(prev => prev.map(s => s.id === id ? { ...s, ...stageData } : s));
  };
  const deleteProjectStage = async (id: string) => {
    await supabase.from('project_stages').delete().eq('id', id);
    setProjectStages(prev => prev.filter(s => s.id !== id));
  };

  const addProjectSubStage = async (subStage: Omit<ProjectSubStage, 'id'>) => {
    const { data, error } = await supabase.from('project_sub_stages').insert([subStage]).select().single();
    if (error) {
      console.error('Erro addProjectSubStage:', error);
      throw error;
    }
    // Update local state to nest it in stages
    setProjectStages(prev => prev.map(s => {
      if (s.id === subStage.stage_id) {
        return { ...s, subStages: [...(s.subStages || []), data] };
      }
      return s;
    }));
  };
  const updateProjectSubStage = async (id: string, subStageData: Partial<ProjectSubStage>) => {
    const { error } = await supabase.from('project_sub_stages').update(subStageData).eq('id', id);
    if (error) {
      console.error('Erro updateProjectSubStage:', error);
      throw error;
    }
    setProjectStages(prev => prev.map(s => ({
      ...s,
      subStages: (s.subStages || []).map(sub => sub.id === id ? { ...sub, ...subStageData } : sub)
    })));
  };
  const deleteProjectSubStage = async (id: string) => {
    await supabase.from('project_sub_stages').delete().eq('id', id);
    setProjectStages(prev => prev.map(s => ({
      ...s,
      subStages: (s.subStages || []).filter(sub => sub.id !== id)
    })));
  };

  // --- RH PONTO ---
  const addTimePunch = async (punch: Omit<TimePunch, 'id'>) => {
    const { data, error } = await supabase.from('time_punches').insert([punch]).select().single();
    if (error) {
      console.error('Erro addTimePunch:', error);
      throw error;
    }
    if (data) setTimePunches(prev => [...prev, data]);
  };
  const updateTimePunch = async (id: string, punchData: Partial<TimePunch>) => {
    const { error } = await supabase.from('time_punches').update(punchData).eq('id', id);
    if (error) {
      console.error('Erro updateTimePunch:', error);
      throw error;
    }
    setTimePunches(prev => prev.map(p => p.id === id ? { ...p, ...punchData } : p));
  };
  const deleteTimePunch = async (id: string) => {
    await supabase.from('time_punches').delete().eq('id', id);
    setTimePunches(prev => prev.filter(p => p.id !== id));
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
      measurements, addMeasurement, updateMeasurement, deleteMeasurement,
      dailyReports, addDailyReport, updateDailyReport, deleteDailyReport,
      projectTasks, addProjectTask, updateProjectTask, deleteProjectTask,
      projectMilestones, addProjectMilestone, updateProjectMilestone, deleteProjectMilestone,
      leads, addLead, updateLead, deleteLead, addLeadInteraction,
      inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, addInventoryMovement, inventoryMovements,
      goals, addGoal, updateGoal, deleteGoal,
      contracts, addContract, updateContract, deleteContract,
      purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
      safetyRecords, addSafetyRecord, updateSafetyRecord, deleteSafetyRecord,
      engineeringDocuments, addEngineeringDocument, deleteEngineeringDocument, uploadFile,
      qualityInspections, addQualityInspection, updateQualityInspection, deleteQualityInspection,
      projectStages, addProjectStage, updateProjectStage, deleteProjectStage, addProjectSubStage, updateProjectSubStage, deleteProjectSubStage,
      timePunches, addTimePunch, updateTimePunch, deleteTimePunch,
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
