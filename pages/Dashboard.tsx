
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Briefcase, Target, PieChart as PieIcon, Activity } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Status } from '../types';

const COLORS = ['#c79229', '#181418', '#94a3b8', '#475569', '#cbd5e1'];
const STATUS_COLORS = {
  [Status.APPROVED]: '#10b981', // Green
  [Status.REJECTED]: '#ef4444', // Red
  [Status.PENDING]: '#c79229'   // Brand Gold
};

const StatCard = ({ title, value, subtext, icon: Icon, trend }: { title: string, value: string, subtext?: string, icon: any, trend?: 'up' | 'down' | 'neutral' | 'brand' }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-[#c79229]/50 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-[#181418]">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${
        trend === 'down' ? 'bg-red-50 text-red-600' : 
        trend === 'brand' ? 'bg-[#181418] text-[#c79229]' :
        'bg-[#c79229]/10 text-[#c79229]'
      }`}>
        <Icon size={24} />
      </div>
    </div>
    {subtext && (
      <div className="mt-4 flex items-center text-sm">
        <span className={trend === 'up' ? 'text-green-600 font-medium' : trend === 'down' ? 'text-red-600 font-medium' : 'text-slate-500'}>
          {subtext}
        </span>
      </div>
    )}
  </div>
);

const Dashboard: React.FC = () => {
  const { financials, projects, proposals, clients, payments } = useData();

  // --- 1. FATURAMENTO MENSAL/ANUAL (Visão de Competência - Inclui Pendentes) ---
  const chartData = useMemo(() => {
    const monthlyMap = new Map<string, { name: string; receita: number; despesa: number; sortDate: number }>();

    financials.forEach(record => {
      // REMOVIDO: if (record.status !== Status.PAID) return; 
      // Agora mostramos tudo que foi lançado para dar feedback visual imediato

      const date = new Date(record.date);
      const monthKey = date.toLocaleString('pt-BR', { month: 'short' });
      const sortKey = date.getFullYear() * 100 + (date.getMonth() + 1);
      const formattedMonth = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);

      if (!monthlyMap.has(formattedMonth)) {
        monthlyMap.set(formattedMonth, { name: formattedMonth, receita: 0, despesa: 0, sortDate: sortKey });
      }

      const entry = monthlyMap.get(formattedMonth)!;
      if (record.type === 'Receita') {
        entry.receita += record.amount;
      } else {
        entry.despesa += record.amount;
      }
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => a.sortDate - b.sortDate)
      .map(({ name, receita, despesa }) => ({ name, receita, despesa }));
  }, [financials]);

  // --- 2. DESPESAS POR CATEGORIA (Inclui Pendentes) ---
  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    
    financials
      .filter(f => f.type === 'Despesa') // Removido filtro de Status.PAID
      .forEach(f => {
        categories[f.category] = (categories[f.category] || 0) + f.amount;
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Order by highest expense
  }, [financials]);

  // --- 3. CONVERSÃO DE PROPOSTAS ---
  const proposalStats = useMemo(() => {
    const stats = {
      [Status.APPROVED]: 0,
      [Status.REJECTED]: 0,
      [Status.PENDING]: 0
    };

    proposals.forEach(p => {
      if (stats[p.status as keyof typeof stats] !== undefined) {
        stats[p.status as keyof typeof stats]++;
      }
    });

    const total = proposals.length;
    const conversionRate = total > 0 ? ((stats[Status.APPROVED] / total) * 100).toFixed(1) : '0';

    const data = [
      { name: 'Aprovadas', value: stats[Status.APPROVED], color: STATUS_COLORS[Status.APPROVED] },
      { name: 'Pendentes', value: stats[Status.PENDING], color: STATUS_COLORS[Status.PENDING] },
      { name: 'Rejeitadas', value: stats[Status.REJECTED], color: STATUS_COLORS[Status.REJECTED] },
    ].filter(i => i.value > 0);

    return { data, conversionRate, total };
  }, [proposals]);

  // --- 4. RECEITA POR TIPO DE SERVIÇO (Inclui Pendentes e Aprovadas) ---
  const revenueByService = useMemo(() => {
    const serviceMap: Record<string, number> = {};

    proposals
      .filter(p => p.status !== Status.REJECTED) // Inclui Aprovadas E Pendentes (pipeline de vendas)
      .forEach(p => {
        p.items.forEach(item => {
          // Agrupa por nome do serviço (simplificado)
          const serviceName = item.name.split('-')[0].trim(); // Pega a primeira parte do nome se houver traço
          serviceMap[serviceName] = (serviceMap[serviceName] || 0) + (item.quantity * item.unitPrice);
        });
      });

    return Object.entries(serviceMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 Serviços
  }, [proposals]);

  // --- 5. PERFORMANCE DE EQUIPE (Baseado em Pagamentos/Volume) ---
  const teamPerformance = useMemo(() => {
    const performance: Record<string, number> = {};
    
    payments.forEach(p => {
      performance[p.name] = (performance[p.name] || 0) + p.value;
    });

    return Object.entries(performance)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 Recebedores/Ativos
  }, [payments]);

  // --- 6. CARTEIRA DE CLIENTES ATIVOS ---
  const activeClientsCount = useMemo(() => {
    const activeClientIds = new Set(
      projects
        .filter(p => p.status === Status.IN_PROGRESS)
        .map(p => p.clientId)
    );
    return activeClientIds.size;
  }, [projects]);

  // Totais Gerais (Visão de Competência)
  const totalRevenue = useMemo(() => financials
    .filter(f => f.type === 'Receita') // Removido filtro de Status.PAID
    .reduce((acc, curr) => acc + curr.amount, 0), [financials]);

  const activeProjects = projects.filter(p => p.status === Status.IN_PROGRESS).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#181418]">Dashboard Gerencial</h1>
        <div className="text-sm text-slate-500">Visão 360º do Negócio</div>
      </div>

      {/* LINHA 1: KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento (Lançado)" 
          value={`R$ ${totalRevenue.toLocaleString()}`} 
          subtext="Receita total (Previsto + Realizado)" 
          icon={TrendingUp} 
          trend="brand" 
        />
        <StatCard 
          title="Taxa de Conversão" 
          value={`${proposalStats.conversionRate}%`} 
          subtext={`${proposalStats.data.find(d => d.name === 'Aprovadas')?.value || 0} propostas fechadas`} 
          icon={Target} 
          trend="up" 
        />
        <StatCard 
          title="Clientes Ativos" 
          value={activeClientsCount.toString()} 
          subtext="Com obras em andamento" 
          icon={Users} 
          trend="neutral" 
        />
        <StatCard 
          title="Obras em Execução" 
          value={activeProjects.toString()} 
          subtext="Projetos ativos" 
          icon={Briefcase} 
          trend="neutral" 
        />
      </div>

      {/* LINHA 2: Gráfico Principal de Faturamento */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#181418]">Faturamento Mensal vs Despesas</h3>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Inclui lançamentos pendentes</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="receita" name="Receita" fill="#c79229" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" name="Despesa" fill="#181418" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINHA 3: Grid de 3 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Despesas por Categoria */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold text-[#181418] mb-4">Despesas por Categoria</h3>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funil de Propostas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold text-[#181418] mb-4">Conversão de Propostas</h3>
          <div className="h-64 flex-1 relative">
             {/* Centro do Gráfico */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-3xl font-bold text-[#181418]">{proposalStats.total}</span>
                  <p className="text-xs text-slate-500 uppercase">Total</p>
                </div>
             </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={proposalStats.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {proposalStats.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receita por Serviço */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold text-[#181418] mb-4">Serviços Mais Vendidos</h3>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart layout="vertical" data={revenueByService} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} interval={0} />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#c79229" radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LINHA 4: Performance de Equipe e Lista Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Performance de Funcionários (Volume Financeiro) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-2 mb-4">
                <Activity size={20} className="text-[#c79229]" />
                <h3 className="text-lg font-bold text-[#181418]">Volume de Pagamentos (Equipe)</h3>
             </div>
             <p className="text-xs text-slate-500 mb-4">Colaboradores com maior volume financeiro processado (Indicador de atividade).</p>
             
             <div className="space-y-4">
                {teamPerformance.map((item, index) => (
                   <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            {index + 1}
                         </div>
                         <span className="font-medium text-slate-800">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                            <div 
                               className="h-full bg-[#181418]" 
                               style={{ width: `${(item.value / (teamPerformance[0]?.value || 1)) * 100}%` }}
                            ></div>
                         </div>
                         <span className="font-bold text-[#c79229] w-24 text-right">R$ {item.value.toLocaleString()}</span>
                      </div>
                   </div>
                ))}
                {teamPerformance.length === 0 && (
                   <p className="text-center text-slate-400 py-8">Sem dados de pagamentos registrados.</p>
                )}
             </div>
          </div>

          {/* Últimas Transações (Mantido, mas compactado) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100">
               <h3 className="text-lg font-bold text-[#181418]">Movimentações Recentes</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3 text-right">Valor</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financials.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-[#181418]">
                          {item.description}
                          <p className="text-xs text-slate-400 font-normal">{new Date(item.date).toLocaleDateString()}</p>
                      </td>
                      <td className={`px-6 py-3 text-right font-bold ${item.type === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'Receita' ? '+' : '-'} R$ {item.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider
                          ${item.status === Status.PAID ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                        `}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
