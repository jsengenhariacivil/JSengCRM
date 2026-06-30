
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
  photos?: string[]; // URLs of photos uploaded to storage
  proposalId?: string; // Link to the original proposal if automated
  stages?: ProjectStage[]; // Cronograma Físico-Financeiro
}

export interface ProjectSubStage {
  id: string;
  stage_id?: string;
  name: string;
  progress: number;
  weight?: number;
}

export interface ProjectStage {
  id: string;
  obra_id?: string;
  name: string;
  weight: number;
  progress: number;
  startDate: string;
  endDate: string;
  value?: number;
  subStages?: ProjectSubStage[];
}

export type FinancialEntity = 'PJ' | 'Pessoal';

export interface FinancialRecord {
  id: string;
  type: 'Receita' | 'Despesa';
  description: string;
  amount: number;
  date: string;
  status: Status;
  category: string;
  projectId?: string; // Optional link to project
  parentRecordId?: string; // For installments/recurrence
  installmentNumber?: number;
  totalInstallments?: number;
  isRecurring?: boolean;
  financial_entity?: FinancialEntity;
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

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  user_id?: string;
  created_at: string;
}

export interface ProposalHistory {
  id: string;
  proposal_id: string;
  description: string;
  contact_type: string;
  user_name: string;
  created_at: string;
}

// --- CRM / LEADS ---
export interface Lead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  status: 'Novo' | 'Contato Feito' | 'Proposta Enviada' | 'Negociação' | 'Perdido' | 'Convertido';
  source: string;
  notes: string;
  value?: number;
  assignedTo?: string;
  createdAt: string;
  lastContact?: string;
}

export interface LeadInteraction {
  id: string;
  leadId: string;
  type: 'Email' | 'Telefone' | 'WhatsApp' | 'Reunião' | 'Nota';
  content: string;
  userName: string;
  createdAt: string;
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
  // Novos campos para RH
  gender?: string;
  document_cpf?: string;
  document_rg?: string;
  birth_date?: string;
  admission_date?: string;
  address?: string;
  emergency_contact?: string;
  bank_pix?: string;
  bank_info?: string;
  dailyRate?: number; // Valor da diária para RH
  paymentType?: 'diaria' | 'quinzenal' | 'mensal' | 'hora';
  base_salary?: number;
  bonus?: number;
  cesta_basica?: number;
  lunch_allowance?: number;
  breakfast_allowance?: number;
  work_schedule?: string; // legível 'seg_sex' ou 'seg_sab' (legado)
  schedule_id?: string; // Relacionamento com tabela de WorkSchedule
}

export interface TimePunch {
  id: string;
  employee_id: string;
  date: string;
  entry_time: string;
  exit_time: string;
  hours_worked: number;
  value_paid: number;
  note?: string;
}

export interface PaymentRecord {
  id: string;
  name: string;
  reference: string;
  date: string;
  value: number;
  status: string;
}

// --- INVENTÁRIO ---
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  location?: string;
  unitPrice: number;
  lastRestocked?: string;
  supplierId?: string;
  status: 'Em Estoque' | 'Baixo Estoque' | 'Indisponível';
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  type: 'Entrada' | 'Saída' | 'Ajuste';
  quantity: number;
  date: string;
  reason: string;
  userName: string;
  projectId?: string;
}

// --- NOVAS INTERFACES DE USUÁRIO E PERMISSÕES ---

export interface UserPermissions {
  viewFinancial: boolean;
  editFinancial: boolean;
  viewProjects: boolean;
  editProjects: boolean;
  viewProposals: boolean;
  editProposals: boolean;
  viewTeam: boolean;
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

// --- NOVAS INTERFACES DE ENGENHARIA (FASE 2) ---

export interface Measurement {
  id: string;
  projectId: string;
  description: string;
  date: string;
  percentage: number; // Percentual desta medição (ex: 15%)
  value: number; // Valor financeiro correspondente
  status: Status;
  photos?: string[];
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
  photos?: string[];
  createdAt: string;
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

// --- METAS ---
export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  type: 'Financeiro' | 'Comercial' | 'Operacional';
  deadline: string;
  status: 'Ativa' | 'Concluída' | 'Expirada';
}
// --- NOVAS SEÇÕES (CONTRATOS, COMPRAS, SEGURANÇA, QUALIDADE) ---

export interface Contract {
  id: string;
  proposalId?: string;
  clientId: string;
  clientName: string;
  title: string;
  value: number;
  startDate: string;
  endDate: string;
  status: 'Rascunho' | 'Assinado' | 'Ativo' | 'Finalizado' | 'Cancelado';
  terms?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  projectId?: string;
  description: string;
  totalValue: number;
  date: string;
  status: 'Pendente' | 'Aprovado' | 'Enviado' | 'Entregue' | 'Cancelado';
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface SafetyRecord {
  id: string;
  type: 'EPI' | 'Treinamento' | 'Inspeção' | 'Incidente' | 'Acidente' | 'Outros';
  title: string;
  description: string;
  date: string;
  responsible: string;
  status: 'Concluído' | 'Pendente' | 'Alerta';
  projectId?: string;
  createdAt: string;
}

export interface EngineeringDocument {
  id: string;
  projectId?: string;
  title: string;
  category: 'Planta' | 'Memorial' | 'Especificação' | 'Outros';
  documentType: 'Link' | 'PDF' | 'Excel';
  fileUrl: string;
  version: string;
  uploadedBy: string;
  createdAt: string;
}

export interface QualityInspection {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'Conforme' | 'Não Conforme' | 'Pendente';
  inspector: string;
  date: string;
  notes?: string;
  createdAt: string;
}

// --- MÓDULO DE FOLHA DE PAGAMENTO ---

export interface WorkSchedule {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  consider_holidays_as_workdays: boolean;
  // Dias trabalhados
  work_monday: boolean;
  work_tuesday: boolean;
  work_wednesday: boolean;
  work_thursday: boolean;
  work_friday: boolean;
  work_saturday: boolean;
  work_sunday: boolean;
  
  start_time: string; // Ex: '08:00'
  end_time: string;   // Ex: '18:00'
  break_duration: number; // Em minutos
  created_at: string;
}

export type AttendanceStatus = 'Presente' | 'Falta' | 'Falta Justificada' | 'Atestado' | 'Férias' | 'Licença' | 'Folga' | 'Compensação' | 'Banco de Horas';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  created_at?: string;
}

export interface PayrollItem {
  description: string;
  type: 'Provento' | 'Desconto';
  amount: number;
}

export interface PayrollResult {
  employee_id: string;
  employee_name: string;
  role: string;
  period_start: string;
  period_end: string;
  schedule_name: string;
  
  // Resumo de dias
  expected_days: number;
  worked_days: number;
  absences: number;
  justified_absences: number;
  medical_certificates: number;
  saturdays: number;
  sundays: number;
  holidays: number;

  // Benefícios Brutos
  base_salary: number;
  bonus: number;
  food_allowance: number; // alimentação total
  coffee_allowance: number; // café total
  basic_basket: number; // cesta básica
  gross_remuneration: number; // Bruto (como se tivesse trabalhado tudo)
  daily_rate: number; // Valor Diário

  // Separação Adiantamento (Dia 20) e Fechamento (Dia 05)
  p1_expected_days: number;
  p1_worked_days: number;
  adiantamento_value: number;
  
  p2_expected_days: number;
  p2_worked_days: number;
  fechamento_value: number;

  // Descontos
  discount_absences: number;
  discount_food: number;
  discount_coffee: number;
  discount_basket: number;
  total_discounts: number;

  // Líquido
  net_value: number;

  items: PayrollItem[]; // Para exibição detalhada
}

