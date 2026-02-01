
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, Legend
} from 'recharts';
import { 
  PieChart as IconPieChart, 
  Calendar, 
  ArrowUpCircle, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Status } from '../types';

const FinancialAnalysis: React.FC = () => {
  const { financials } = useData();
  const [activeTab, setActiveTab] = useState<'dre' | 'cashflow' | 'payables'>('dre');
  
  // Estado para filtro de data (Mês/Ano). Inicializa com o mês atual YYYY-MM
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7));

  // --- HELPER FUNCTIONS ---

  // Correção Lógica: Comparação via String evita problemas de Timezone (Fuso Horário)
  // que faziam lançamentos do dia 01 caírem no mês anterior.
  const getMonthData = () => {
    return financials.filter(record => record.date.startsWith(selectedDate));
  };

  const filteredData = useMemo(() => getMonthData(), [financials, selectedDate]);

  // --- DRE LOGIC ---
  const dreData = useMemo(() => {
    // Receita Bruta
    const grossRevenue = filteredData
      .filter(f => f.type === 'Receita') 
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Custos Variáveis (Ligados diretamente à produção/obra)
    const variableCosts = filteredData
      .filter(f => f.type === 'Despesa' && ['Materiais', 'Mão de Obra', 'Obra', 'Taxas'].includes(f.category))
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Despesas Fixas (Administrativo, Aluguel, etc)
    const fixedExpenses = filteredData
      .filter(f => f.type === 'Despesa' && !['Materiais', 'Mão de Obra', 'Obra', 'Taxas'].includes(f.category))
      .reduce((acc, curr) => acc + curr.amount, 0);

    const grossProfit = grossRevenue - variableCosts;
    const netResult = grossProfit - fixedExpenses;

    return { grossRevenue, variableCosts, fixedExpenses, grossProfit, netResult };
  }, [filteredData]);

  // --- CASH FLOW LOGIC ---
  const cashFlowChartData = useMemo(() => {
    // Determinar quantos dias tem o mês selecionado
    const [yearStr, monthStr] = selectedDate.split('-');
    const daysInMonth = new Date(Number(yearStr), Number(monthStr), 0).getDate();
    
    // Mapa para agrupar por dia
    const dailyMap = new Map<number, { day: string, entrada: number, saida: number, saldo: number }>();

    // Inicializa todos os dias do mês com zero
    for (let i = 1; i <= daysInMonth; i++) {
        dailyMap.set(i, { day: i.toString(), entrada: 0, saida: 0, saldo: 0 });
    }

    filteredData.forEach(f => {
        if (f.status !== Status.PAID) return; // Apenas pagos entram no fluxo realizado

        // Extrai o dia diretamente da string YYYY-MM-DD para evitar erro de fuso horário
        // Ex: "2023-10-05" -> split('-') -> ["2023", "10", "05"] -> dia 5
        const day = parseInt(f.date.split('-')[2]);
        
        const entry = dailyMap.get(day);

        if (entry) {
            if (f.type === 'Receita') entry.entrada += f.amount;
            else entry.saida += f.amount;
        }
    });

    let accumulatedBalance = 0;
    const result = [];
    
    // Calcula acumulado dia a dia
    for (let i = 1; i <= daysInMonth; i++) {
        const entry = dailyMap.get(i)!;
        accumulatedBalance += (entry.entrada - entry.saida);
        result.push({ ...entry, acumulado: accumulatedBalance });
    }
    
    return result;
  }, [filteredData, selectedDate]);

  // --- PAYABLES LOGIC ---
  const payablesData = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Contas a pagar olha todo o banco de dados (passado em aberto e futuro), não apenas o mês selecionado
    return financials
      .filter(f => f.type === 'Despesa' && (f.status === Status.PENDING || f.status === Status.LATE))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => {
        // Correção de timezone para cálculo de dias restantes
        const [y, m, d] = item.date.split('-').map(Number);
        const dueDate = new Date(y, m - 1, d); // Cria data local
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let statusLabel = '';
        let statusColor = '';

        if (diffDays < 0) {
            statusLabel = `Atrasado ${Math.abs(diffDays)} dias`;
            statusColor = 'text-red-600 bg-red-50 border-red-200';
        } else if (diffDays === 0) {
            statusLabel = 'Vence Hoje';
            statusColor = 'text-orange-600 bg-orange-50 border-orange-200';
        } else {
            statusLabel = `Vence em ${diffDays} dias`;
            statusColor = 'text-blue-600 bg-blue-50 border-blue-200';
        }

        return { ...item, statusLabel, statusColor, diffDays };
      });
  }, [financials]); 

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181418]">Análise Financeira</h1>
          <p className="text-slate-500">Relatórios gerenciais, DRE e controle de vencimentos</p>
        </div>
        
        {/* Correção visual do input: Fundo branco explícito e borda azulada ao focar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-slate-200 shadow-sm focus-within:border-[#c79229] transition-colors">
          <Calendar size={20} className="text-[#c79229]" />
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Período:</span>
          <input 
            type="month" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="outline-none text-slate-800 font-bold bg-white cursor-pointer w-full"
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="flex border-b border-slate-100 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('dre')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'dre' 
                ? 'text-[#c79229] border-b-2 border-[#c79229] font-bold bg-orange-50/30' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <TrendingUp size={18} />
            DRE Gerencial
          </button>
          <button 
            onClick={() => setActiveTab('cashflow')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'cashflow' 
                ? 'text-[#c79229] border-b-2 border-[#c79229] font-bold bg-orange-50/30' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <IconPieChart size={18} />
            Fluxo de Caixa
          </button>
          <button 
            onClick={() => setActiveTab('payables')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'payables' 
                ? 'text-[#c79229] border-b-2 border-[#c79229] font-bold bg-orange-50/30' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <AlertCircle size={18} />
            Contas a Pagar
            {payablesData.filter(p => p.diffDays <= 0).length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {payablesData.filter(p => p.diffDays <= 0).length}
              </span>
            )}
          </button>
        </div>

        <div className="p-6">
            {/* --- TAB: DRE --- */}
            {activeTab === 'dre' && (
                <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8">
                         <h3 className="text-lg font-bold text-[#181418] mb-1">Resultado do Exercício</h3>
                         <p className="text-sm text-slate-500 mb-6">Competência: {selectedDate}</p>

                         <div className="space-y-4">
                            {/* Receita */}
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                <div className="flex items-center gap-2">
                                    <ArrowUpCircle className="text-green-600" size={20} />
                                    <span className="font-bold text-slate-700">(+) Receita Bruta</span>
                                </div>
                                <span className="font-bold text-green-600 text-lg">R$ {dreData.grossRevenue.toLocaleString()}</span>
                            </div>

                            {/* Custos Variáveis */}
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 pl-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                    <span className="text-slate-600">(-) Custos Diretos (Obra, Materiais, Taxas)</span>
                                </div>
                                <span className="text-red-500">R$ {dreData.variableCosts.toLocaleString()}</span>
                            </div>

                            {/* Lucro Bruto */}
                            <div className="flex justify-between items-center py-2 bg-slate-200/50 px-3 rounded">
                                <span className="font-bold text-slate-800">(=) Margem de Contribuição</span>
                                <span className="font-bold text-slate-800">R$ {dreData.grossProfit.toLocaleString()}</span>
                            </div>

                            {/* Despesas Fixas */}
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 pl-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                    <span className="text-slate-600">(-) Despesas Fixas (Adm, Aluguel, Geral)</span>
                                </div>
                                <span className="text-red-500">R$ {dreData.fixedExpenses.toLocaleString()}</span>
                            </div>

                            {/* Resultado Líquido */}
                            <div className={`flex justify-between items-center p-4 rounded-lg border ${dreData.netResult >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} mt-4`}>
                                <div className="flex items-center gap-3">
                                    <TrendingUp size={24} className={dreData.netResult >= 0 ? 'text-green-700' : 'text-red-700'} />
                                    <span className={`font-bold text-lg ${dreData.netResult >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                                        (=) Lucro/Prejuízo Líquido
                                    </span>
                                </div>
                                <span className={`font-bold text-2xl ${dreData.netResult >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    R$ {dreData.netResult.toLocaleString()}
                                </span>
                            </div>
                         </div>
                    </div>
                </div>
            )}

            {/* --- TAB: FLUXO DE CAIXA --- */}
            {activeTab === 'cashflow' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <p className="text-xs text-green-600 font-bold uppercase">Total Entradas (Pago)</p>
                            <p className="text-xl font-bold text-green-700">
                                R$ {cashFlowChartData.reduce((acc, curr) => acc + curr.entrada, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <p className="text-xs text-red-600 font-bold uppercase">Total Saídas (Pago)</p>
                            <p className="text-xl font-bold text-red-700">
                                R$ {cashFlowChartData.reduce((acc, curr) => acc + curr.saida, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-600 font-bold uppercase">Saldo do Período</p>
                            <p className={`text-xl font-bold ${cashFlowChartData[cashFlowChartData.length-1]?.acumulado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                R$ {cashFlowChartData[cashFlowChartData.length-1]?.acumulado.toLocaleString() || '0'}
                            </p>
                        </div>
                    </div>

                    <div className="h-[400px] w-full bg-white p-2">
                        <h4 className="text-sm font-bold text-slate-600 mb-4 text-center">Evolução Diária (Entradas x Saídas x Saldo Acumulado)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cashFlowChartData}>
                                <defs>
                                    <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#c79229" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#c79229" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                                />
                                <Legend />
                                <Bar dataKey="entrada" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="saida" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                <Area type="monotone" dataKey="acumulado" name="Saldo Acumulado" stroke="#c79229" fillOpacity={1} fill="url(#colorSaldo)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* --- TAB: CONTAS A PAGAR --- */}
            {activeTab === 'payables' && (
                <div className="animate-in fade-in duration-300">
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg whitespace-nowrap">
                            <span className="text-xs text-red-500 font-bold uppercase block">Vencidos</span>
                            <span className="text-lg font-bold text-red-700">
                                {payablesData.filter(p => p.diffDays < 0).length} contas
                            </span>
                        </div>
                        <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg whitespace-nowrap">
                            <span className="text-xs text-orange-500 font-bold uppercase block">Vence Hoje</span>
                            <span className="text-lg font-bold text-orange-700">
                                {payablesData.filter(p => p.diffDays === 0).length} contas
                            </span>
                        </div>
                         <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg whitespace-nowrap">
                            <span className="text-xs text-blue-500 font-bold uppercase block">Próx. 7 Dias</span>
                            <span className="text-lg font-bold text-blue-700">
                                {payablesData.filter(p => p.diffDays > 0 && p.diffDays <= 7).length} contas
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Vencimento</th>
                                    <th className="px-6 py-4">Descrição</th>
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4 text-center">Status Vencimento</th>
                                    <th className="px-6 py-4 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payablesData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </td>
                                        <td className="px-6 py-4 text-[#181418] font-medium">
                                            {item.description}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {item.category}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${item.statusColor}`}>
                                                {item.statusLabel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                                            R$ {item.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {payablesData.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                            <CheckCircle size={32} className="mx-auto mb-2 text-green-500 opacity-50" />
                                            Nenhuma conta pendente encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalysis;
