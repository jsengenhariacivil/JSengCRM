
export enum Status {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído',
  PAID = 'Pago',
  LATE = 'Atrasado',
  APPROVED = 'Aprovado',
  REJECTED = 'Rejeitado'
}

export interface Client {
  id: string;
  name: string;
  document: string; // CPF/CNPJ
  email: string;
  phone: string;
  address: string;
  type: 'Pessoa Física' | 'Pessoa Jurídica';
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  address: string;
  status: Status;
  startDate: string;
  endDate: string;
  budget: number;
  progress: number; // 0-100
}

export interface FinancialRecord {
  id: string;
  type: 'Receita' | 'Despesa';
  description: string;
  amount: number;
  date: string;
  status: Status;
  category: string;
  projectId?: string; // Optional link to project
}

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  unit: string;
}

export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  items: { serviceId: string; name: string; quantity: number; unitPrice: number }[];
  total: number;
  status: Status;
  date: string;
}

export interface Supplier {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  category: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  type: string;
  email: string;
  phone: string;
  status: string;
}

export interface PaymentRecord {
  id: string;
  name: string;
  reference: string;
  date: string;
  value: number;
  status: string;
}

// --- NOVAS INTERFACES DE USUÁRIO E PERMISSÕES ---

export interface UserPermissions {
  viewFinancial: boolean;
  editFinancial: boolean;
  viewProjects: boolean;
  editProjects: boolean;
  manageSettings: boolean;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: UserPermissions;
  password?: string; // Opcional para o mock, em prod seria hash
}

// --- NOVAS INTERFACES DE ENGENHARIA (FASE 2) ---

export interface Measurement {
  id: string;
  projectId: string;
  description: string;
  date: string;
  percentage: number; // Percentual desta medição (ex: 15%)
  value: number; // Valor financeiro correspondente
  status: Status;
}

export interface DailyReport {
  id: string;
  projectId: string;
  date: string;
  weatherMorning: 'Ensolaorado' | 'Chuva' | 'Nublado' | 'Instável';
  weatherAfternoon: 'Ensolaorado' | 'Chuva' | 'Nublado' | 'Instável';
  laborTotal: number;
  equipmentNotes: string;
  activitiesNotes: string;
  occurrencesNotes: string;
  images?: DailyReportImage[];
  createdAt: string;
}

export interface DailyReportImage {
  id: string;
  reportId: string;
  url: string;
  caption?: string;
}

// --- NOVAS INTERFACES DE PLANEJAMENTO (ETAPA 2) ---

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies?: string[];
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  date: string;
  isCompleted: boolean;
}
