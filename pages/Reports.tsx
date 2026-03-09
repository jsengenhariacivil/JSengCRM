import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Filter, Calendar, FileText, Printer } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RePie, Pie, Cell } from 'recharts';

const Reports: React.FC = () => {
    const { projects, financials, clients } = useData();

    // Mock data for charts
    const performanceData = [
        { name: 'Jan', vendas: 4000, obras: 2400 },
        { name: 'Fev', vendas: 3000, obras: 1398 },
        { name: 'Mar', vendas: 2000, obras: 9800 },
        { name: 'Abr', vendas: 2780, obras: 3908 },
        { name: 'Mai', vendas: 1890, obras: 4800 },
        { name: 'Jun', vendas: 2390, obras: 3800 },
    ];

    const statusData = [
        { name: 'Em Andamento', value: projects.filter(p => p.status === 'Em Andamento').length || 1 },
        { name: 'Concluído', value: projects.filter(p => p.status === 'Concluído').length || 1 },
        { name: 'Pendente', value: projects.filter(p => p.status === 'Pendente').length || 1 },
    ];

    const COLORS = ['#c79229', '#10b981', '#64748b'];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="text-[#c79229]" />
                        Relatórios e BI
                    </h1>
                    <p className="text-slate-500 text-sm">Análise de desempenho e indicadores (KPIs)</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm">
                        <Filter size={16} />
                        <span>Filtros</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all font-bold text-sm">
                        <Download size={16} />
                        <span>Exportar PDF</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Obras Ativas', val: projects.length, label2: '+2 este mês', color: 'text-blue-600' },
                    { label: 'Receita Total', val: `R$ ${financials.reduce((a, c) => a + (c.type === 'Receita' ? c.amount : 0), 0).toLocaleString()}`, label2: 'Previsão: +15%', color: 'text-green-600' },
                    { label: 'Contratos', val: '12', label2: '8 assinados', color: 'text-[#c79229]' },
                    { label: 'Clientes', val: clients.length, label2: 'Base de dados', color: 'text-slate-800' },
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
                        Desempenho Comercial x Operacional
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="vendas" name="Vendas (R$)" fill="#c79229" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="obras" name="Início de Obras" fill="#1e293b" radius={[4, 4, 0, 0]} />
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
                                    {statusData.map((entry, index) => (
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
                            <span className="text-slate-500">Conclusão Média</span>
                            <span className="text-[#c79229]">74%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#c79229] h-full" style={{ width: '74%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Relatórios Disponíveis para Download</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { title: 'Relatório Financeiro Mensal', type: 'PDF', date: '01/03/2024' },
                        { title: 'Status Report de Obras', type: 'Excel', date: '05/03/2024' },
                        { title: 'Consolidado Comercial Q1', type: 'PDF', date: '07/03/2024' },
                        { title: 'Inventário Geral de Almoxarifado', type: 'PDF', date: '08/03/2024' },
                    ].map((report, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-red-50 text-red-500 rounded"><FileText size={20} /></div>
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">{report.title}</p>
                                    <p className="text-xs text-slate-400">Gerado em: {report.date}</p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-[#c79229] hover:bg-[#c79229]/10 rounded-lg transition-all">
                                <Printer size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;
