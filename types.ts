
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

export interface ProposalItem {
  id?: string;
  proposalId?: string;
  etapaId?: string;
  parentId?: string; // For Subcomposições or Insumos inside a Composição
  serviceId: string; // Reference ID
  code: string;      // SINAPI code or custom
  banco: string;     // SINAPI, ORSE, SETOP, PROPRIO
  name: string;
  type: 'COMPOSICAO' | 'SUBCOMPOSICAO' | 'INSUMO';
  origin: 'BASE' | 'PERSONALIZADO';
  version: number;
  quantity: number;
  unitPrice: number;
  unit?: string;
  order?: number;
  children?: ProposalItem[]; // Nested hierarchy (in-memory)
}

export interface ProposalEtapa {
  id?: string;
  proposalId?: string;
  name: string;
  order: number;
  items: ProposalItem[]; // Top-level items of this Etapa
}

export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  etapas: ProposalEtapa[];
  items?: ProposalItem[]; // Legacy support or ungrouped items
  total: number;
  bdi?: number;
  status: Status;
  date: string;
}

export interface SinapiService {
  code: string;
  description: string;
  unit: string;
  price: number;
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
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: UserPermissions;
  password?: string; // Opcional para o mock, em prod seria hash
}

// --- AGENDA GERENCIAL ---

export interface AgendaEvento {
  id: string;
  origemModulo: 'OBRA' | 'ORCAMENTO' | 'FINANCEIRO' | 'MANUAL';
  idReferencia?: string | null;
  tipoEvento: string;
  titulo: string;
  descricao?: string;
  responsavel?: string;
  setor?: string;
  dataInicio: string; // ISO 8601
  dataFim?: string;   // ISO 8601
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  status: 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO';
  linkInterno?: string;
  criadoAutomatico: boolean;
  eventoCritico: boolean;
  createdAt?: string;
}
