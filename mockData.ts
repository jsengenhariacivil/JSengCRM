import { Client, Project, FinancialRecord, Status, Service, Proposal } from './types';

export const mockClients: Client[] = [
  { id: '1', name: 'Construtora Horizonte', document: '12.345.678/0001-99', email: 'contato@horizonte.com', phone: '(11) 99999-9999', address: 'Av. Paulista, 1000', type: 'Pessoa Jurídica' },
  { id: '2', name: 'João da Silva', document: '123.456.789-00', email: 'joao@email.com', phone: '(11) 98888-8888', address: 'Rua das Flores, 123', type: 'Pessoa Física' },
  { id: '3', name: 'Maria Oliveira', document: '987.654.321-11', email: 'maria@email.com', phone: '(11) 97777-7777', address: 'Alameda Santos, 500', type: 'Pessoa Física' },
];

export const mockProjects: Project[] = [
  { id: '1', title: 'Residencial Green Valley', clientId: '1', clientName: 'Construtora Horizonte', address: 'Rua Verde, 400', status: Status.IN_PROGRESS, startDate: '2023-10-01', endDate: '2024-05-01', budget: 450000, progress: 65 },
  { id: '2', title: 'Reforma Apto 402', clientId: '2', clientName: 'João da Silva', address: 'Rua das Flores, 123', status: Status.COMPLETED, startDate: '2023-11-15', endDate: '2023-12-20', budget: 25000, progress: 100 },
  { id: '3', title: 'Projeto Estrutural Galpão', clientId: '3', clientName: 'Maria Oliveira', address: 'Zone Industrial, 55', status: Status.PENDING, startDate: '2024-02-01', endDate: '2024-03-01', budget: 15000, progress: 0 },
];

export const mockFinancials: FinancialRecord[] = [
  { id: '1', type: 'Receita', description: 'Entrada Proj. Green Valley', amount: 150000, date: '2023-10-05', status: Status.PAID, category: 'Projeto', projectId: '1' },
  { id: '2', type: 'Despesa', description: 'Material Elétrico', amount: 5000, date: '2023-10-10', status: Status.PAID, category: 'Materiais', projectId: '1' },
  { id: '3', type: 'Despesa', description: 'Licença Prefeitura', amount: 1200, date: '2023-10-15', status: Status.PAID, category: 'Taxas', projectId: '2' },
  { id: '4', type: 'Receita', description: 'Pagamento Final Reforma', amount: 12500, date: '2023-12-22', status: Status.PENDING, category: 'Obra', projectId: '2' },
  { id: '5', type: 'Despesa', description: 'Aluguel Escritório', amount: 2500, date: '2024-01-05', status: Status.PENDING, category: 'Administrativo' },
];

export const mockServices: Service[] = [
  { id: '1', name: 'Projeto Arquitetônico', description: 'Desenvolvimento de planta baixa e fachadas', basePrice: 50, unit: 'm²' },
  { id: '2', name: 'Laudo Técnico', description: 'Vistoria e emissão de ART', basePrice: 1500, unit: 'un' },
  { id: '3', name: 'Acompanhamento de Obra', description: 'Visitas técnicas semanais', basePrice: 2000, unit: 'mês' },
  { id: '4', name: 'Cálculo Estrutural', description: 'Dimensionamento de vigas e pilares', basePrice: 40, unit: 'm²' },
];

export const mockProposals: Proposal[] = [
  { id: '1', clientId: '2', clientName: 'João da Silva', date: '2023-09-01', status: Status.APPROVED, total: 25000, items: [] },
  { id: '2', clientId: '1', clientName: 'Construtora Horizonte', date: '2024-01-15', status: Status.PENDING, total: 12000, items: [] },
];
