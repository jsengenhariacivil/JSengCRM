import React, { useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Filter, FileText, Printer, FileSpreadsheet } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RePie, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
    const { projects, financials, clients, contracts } = useData();

    // 1. Processamento de Dados para o Gráfico de Desempenho (Últimos 6 meses)
    const performanceData = useMemo(() => {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: d.getMonth(),
                year: d.getFullYear(),
                label: d.toLocaleDateString('pt-BR', { month: 'short' }),
                vendas: 0,
                obras: 0
            });
        }

        // Soma receitas por mês
        financials.forEach(f => {
            if (f.type === 'Receita') {
                const fDate = new Date(f.date);
                const monthMatch = months.find(m => m.month === fDate.getMonth() && m.year === fDate.getFullYear());
                if (monthMatch) {
                    monthMatch.vendas += f.amount;
                }
            }
        });

        // Conta início de obras por mês
        projects.forEach(p => {
            if (p.startDate) {
                const pDate = new Date(p.startDate);
                const monthMatch = months.find(m => m.month === pDate.getMonth() && m.year === pDate.getFullYear());
                if (monthMatch) {
                    monthMatch.obras += 1;
                }
            }
        });

        return months.map(m => ({
            name: m.label,
            vendas: m.vendas,
            obras: m.obras
        }));
    }, [financials, projects]);

    // 2. Dados de Status (Real)
    const statusData = useMemo(() => [
        { name: 'Em Andamento', value: projects.filter(p => p.status === 'Em Andamento').length },
        { name: 'Concluído', value: projects.filter(p => p.status === 'Concluído').length },
        { name: 'Pendente', value: projects.filter(p => p.status === 'Pendente').length },
    ].filter(d => d.value > 0), [projects]);

    const COLORS = ['#c79229', '#10b981', '#64748b'];

    // 3. Funções de Exportação
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Aba Financeiro
        const wsFin = XLSX.utils.json_to_sheet(financials.map(f => ({
            Data: f.date,
            Tipo: f.type,
            Descrição: f.description,
            Valor: f.amount,
            Categoria: f.category,
            Status: f.status
        })));
        XLSX.utils.book_append_sheet(wb, wsFin, "Financeiro");

        // Aba Projetos
        const wsProj = XLSX.utils.json_to_sheet(projects.map(p => ({
            Projeto: p.title,
            Cliente: p.clientName,
            Status: p.status,
            Início: p.startDate,
            Progresso: `${p.progress}%`,
            Orçamento: p.budget
        })));
        XLSX.utils.book_append_sheet(wb, wsProj, "Projetos");

        XLSX.writeFile(wb, `Relatorio_JSeng_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrintPDF = () => {
        window.print();
    };

    return (
        <div className="p-6 space-y-6 print:p-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="text-[#c79229]" />
                        Relatórios e BI
                    </h1>
                    <p className="text-slate-500 text-sm">Análise de desempenho e indicadores (KPIs)</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm"
                    >
                        <FileSpreadsheet size={16} className="text-green-600" />
                        <span>Exportar Excel</span>
                    </button>
                    <button
                        onClick={handlePrintPDF}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all font-bold text-sm"
                    >
                        <Download size={16} />
                        <span>Gerar PDF</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Obras Ativas', val: projects.filter(p => p.status === 'Em Andamento').length, label2: 'Em execução', color: 'text-blue-600' },
                    { label: 'Receita Total', val: `R$ ${financials.reduce((a, c) => a + (c.type === 'Receita' ? c.amount : 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, label2: 'Acumulado histórico', color: 'text-green-600' },
                    { label: 'Contratos', val: contracts.length, label2: `${contracts.filter(c => c.status === 'Assinado').length} assinados`, color: 'text-[#c79229]' },
                    { label: 'Clientes', val: clients.length, label2: 'Base de dados total', color: 'text-slate-800' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">{stat.label}</p>
                        <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">{stat.label2}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#c79229]" />
                        Financeiro Avanço (Receitas) x Novas Obras
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    formatter={(value: any) => typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="vendas" name="Receitas (R$)" fill="#c79229" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="obras" name="Obras Iniciadas" fill="#1e293b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-6">Status dos Projetos</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePie>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </RePie>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-500">Progresso Médio Geral</span>
                            <span className="text-[#c79229]">
                                {projects.length > 0
                                    ? Math.round(projects.reduce((a, c) => a + (c.progress || 0), 0) / projects.length)
                                    : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-[#c79229] h-full transition-all duration-1000"
                                style={{ width: `${projects.length > 0 ? projects.reduce((a, c) => a + (c.progress || 0), 0) / projects.length : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Exploração de Dados</h3>
                </div>
                <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <FileText size={32} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-700">Relatórios Detalhados</p>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            Utilize os botões de exportação no topo da página para baixar planilhas completas com todos os lançamentos financeiros e status de obras.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
