import React, { useState, useMemo } from 'react';
import { Settings, Calendar as CalendarIcon, Briefcase, FileText, Plus, AlertTriangle, CheckCircle, Clock, Trash2, Edit2, Zap, List as ListIcon } from 'lucide-react';
import WeeklyCalendar from '../components/Agenda/WeeklyCalendar';
import { useData } from '../context/DataContext';
import { AgendaEvento } from '../types';

export default function Agenda() {
    const { agendaEventos, addAgendaEvent, updateAgendaEvent, deleteAgendaEvent, users, teamMembers } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AgendaEvento | null>(null);
    const [duracaoMinutos, setDuracaoMinutos] = useState(30);
    const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('CALENDAR');
    const [statusFilter, setStatusFilter] = useState<'PENDENTE' | 'CONCLUIDO' | 'CANCELADO' | 'TODOS'>('PENDENTE');
    const [formData, setFormData] = useState<Partial<AgendaEvento>>({
        tipoEvento: '',
        titulo: '',
        descricao: '',
        dataInicio: '',
        dataFim: '',
        prioridade: 'MEDIA',
        status: 'PENDENTE',
        eventoCritico: false,
        origemModulo: 'MANUAL',
        criadoAutomatico: false
    });

    const getLocalString = (isoString: string | undefined | null) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '';
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Verificar sobreposição local de horário de 30 em 30 min (double booking)
            if (formData.dataInicio) {
                const inicioRef = new Date(formData.dataInicio).getTime();
                const fimRef = inicioRef + duracaoMinutos * 60000;

                const overbooking = agendaEventos.find(ev => {
                    if (ev.id === editingEvent?.id) return false;
                    if (ev.origemModulo !== 'MANUAL') return false; // Permite obras ou prazos que caiam no mesmo dia, mas restringe os manuais (reuniões).
                    if (ev.status === 'CANCELADO' || ev.status === 'CONCLUIDO') return false;
                    if (!ev.dataInicio) return false;

                    const evInicio = new Date(ev.dataInicio).getTime();
                    const evFim = ev.dataFim ? new Date(ev.dataFim).getTime() : evInicio + 30 * 60000;

                    // Checa se os intervalos se cruzam
                    return (inicioRef < evFim && fimRef > evInicio);
                });

                if (overbooking) {
                    alert('Conflito de agendamento! Já existe um compromisso para este bloco de horário.');
                    return;
                }
            }

            // Calcular o fim baseado na duração
            const novaDataInicio = formData.dataInicio ? new Date(formData.dataInicio).toISOString() : '';
            let novaDataFim = '';
            if (novaDataInicio) {
                const fim = new Date(new Date(novaDataInicio).getTime() + duracaoMinutos * 60000);
                novaDataFim = fim.toISOString();
            }

            if (editingEvent) {
                await updateAgendaEvent({ ...editingEvent, ...formData, dataInicio: novaDataInicio, dataFim: novaDataFim } as AgendaEvento);
            } else {
                await addAgendaEvent({
                    ...formData,
                    dataInicio: novaDataInicio,
                    dataFim: novaDataFim,
                    id: '',
                    origemModulo: 'MANUAL',
                    criadoAutomatico: false,
                } as AgendaEvento);
            }
            setIsModalOpen(false);
            setEditingEvent(null);
        } catch (error: any) {
            alert("Erro ao salvar evento: " + error.message);
        }
    };

    const openEdit = (evento: AgendaEvento) => {
        setEditingEvent(evento);
        setFormData(evento);
        if (evento.dataInicio && evento.dataFim) {
            const di = new Date(evento.dataInicio).getTime();
            const df = new Date(evento.dataFim).getTime();
            setDuracaoMinutos(Math.max(30, (df - di) / 60000));
        } else {
            setDuracaoMinutos(30);
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Deseja deletar este evento manual? Eventos vinculados a Obras e Orçamentos só podem ser deletados através de sua origem.")) {
            await deleteAgendaEvent(id);
        }
    };

    // KPIs
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    // Filter events for the Main Content
    const filteredEvents = agendaEventos.filter(e => {
        if (statusFilter !== 'TODOS' && e.status !== statusFilter) return false;
        return true;
    });

    // KPIs use only pending events
    const pendingEvents = agendaEventos.filter(e => e.status === 'PENDENTE');
    const criticalEvents = pendingEvents.filter(e => e.eventoCritico);
    const expiringProjects = pendingEvents.filter(e => e.origemModulo === 'OBRA' && new Date(e.dataInicio) <= next7Days);
    const expiringProposals = pendingEvents.filter(e => e.origemModulo === 'ORCAMENTO' && new Date(e.dataInicio) <= next7Days);
    const weekMeetings = pendingEvents.filter(e => e.origemModulo === 'MANUAL' && e.tipoEvento.toLowerCase().includes('reuni') && new Date(e.dataInicio) <= next7Days);

    const getPriorityColor = (prioridade: string | undefined) => {
        switch (prioridade) {
            case 'ALTA': return 'bg-red-500 text-white';
            case 'MEDIA': return 'bg-yellow-500 text-white';
            case 'BAIXA': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getModuleIcon = (origem: string) => {
        switch (origem) {
            case 'OBRA': return <Briefcase className="w-5 h-5 text-[#c79229]" />;
            case 'ORCAMENTO': return <FileText className="w-5 h-5 text-emerald-500" />;
            case 'FINANCEIRO': return <Zap className="w-5 h-5 text-yellow-500" />;
            default: return <CalendarIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Agenda Gerencial</h1>
                    <p className="text-gray-500">Central inteligente de prazos, compromissos e eventos.</p>
                </div>
                <button
                    onClick={() => { setEditingEvent(null); setFormData({ origemModulo: 'MANUAL', prioridade: 'MEDIA', status: 'PENDENTE', criadoAutomatico: false }); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67a21] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Novo Evento Manual
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 bg-white border rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="font-semibold">Eventos Críticos</h3>
                    </div>
                    <p className="text-3xl font-bold">{criticalEvents.length}</p>
                </div>

                <div className="p-4 bg-white border rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-[#c79229] mb-2">
                        <Briefcase className="w-5 h-5" />
                        <h3 className="font-semibold">Obras e Prazos Próx.</h3>
                    </div>
                    <p className="text-3xl font-bold">{expiringProjects.length}</p>
                </div>

                <div className="p-4 bg-white border rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                        <Clock className="w-5 h-5" />
                        <h3 className="font-semibold">Propostas Vencendo</h3>
                    </div>
                    <p className="text-3xl font-bold">{expiringProposals.length}</p>
                </div>

                <div className="p-4 bg-white border rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <CalendarIcon className="w-5 h-5" />
                        <h3 className="font-semibold">Reuniões (7 dias)</h3>
                    </div>
                    <p className="text-3xl font-bold">{weekMeetings.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        Próximos Eventos
                    </h2>

                    <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-lg border">
                        <div className="flex bg-white rounded-md shadow-sm">
                            <button
                                onClick={() => setViewMode('CALENDAR')}
                                className={`px-3 py-1.5 text-sm font-bold rounded-l-md flex items-center gap-2 transition-colors ${viewMode === 'CALENDAR' ? 'bg-[#c79229] text-[#181418]' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <CalendarIcon className="w-4 h-4" /> Calendário
                            </button>
                            <button
                                onClick={() => setViewMode('LIST')}
                                className={`px-3 py-1.5 text-sm font-bold rounded-r-md flex items-center gap-2 transition-colors ${viewMode === 'LIST' ? 'bg-[#c79229] text-[#181418]' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <ListIcon className="w-4 h-4" /> Lista
                            </button>
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e: any) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium text-slate-700 cursor-pointer outline-none focus:ring-0"
                        >
                            <option value="PENDENTE">Pendentes</option>
                            <option value="CONCLUIDO">Concluídos</option>
                            <option value="CANCELADO">Cancelados</option>
                            <option value="TODOS">Todos os Status</option>
                        </select>
                    </div>
                </div>

                {viewMode === 'CALENDAR' ? (
                    <WeeklyCalendar
                        events={filteredEvents}
                        onEventClick={(ev) => openEdit(ev)}
                        getPriorityColor={getPriorityColor}
                    />
                ) : (
                    <div className="space-y-4">
                        {filteredEvents.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                Nenhum evento futuro encontrado.
                            </div>
                        ) : (
                            filteredEvents.map(evento => (
                                <div
                                    key={evento.id}
                                    className={`flex items-start gap-4 p-4 rounded-lg border ${evento.eventoCritico ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'} hover:shadow-md transition-shadow`}
                                >
                                    <div className="p-2 bg-white rounded-lg border shadow-sm flex-shrink-0">
                                        {getModuleIcon(evento.origemModulo)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {evento.titulo}
                                            </h3>
                                            {evento.eventoCritico && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Crítico
                                                </span>
                                            )}
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(evento.prioridade)}`}>
                                                {evento.prioridade}
                                            </span>
                                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                                                {evento.origemModulo}
                                            </span>
                                        </div>
                                        {evento.descricao && <p className="text-sm text-gray-600 mb-2 truncate">{evento.descricao}</p>}
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(evento.dataInicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </div>
                                            {evento.responsavel && (
                                                <div className="flex items-center gap-1">
                                                    <Settings className="w-3 h-3" /> {evento.responsavel}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {evento.origemModulo === 'MANUAL' && (
                                            <button onClick={() => openEdit(evento)} className="p-2 text-gray-400 hover:text-[#c79229] rounded-lg hover:bg-white transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {evento.origemModulo === 'MANUAL' && (
                                            <button onClick={() => handleDelete(evento.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => updateAgendaEvent({ ...evento, status: 'CONCLUIDO' })}
                                            className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-white transition-colors"
                                            title="Marcar como Concluído"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">{editingEvent ? 'Editar Evento Manual' : 'Novo Evento Manual'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Título</label>
                                <input required value={formData.titulo || ''} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#c79229]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo de Evento</label>
                                    <input list="tipo-evento-options" required placeholder="Ex: Reunião Presencial" value={formData.tipoEvento || ''} onChange={e => setFormData({ ...formData, tipoEvento: e.target.value })} className="w-full p-2 border rounded" />
                                    <datalist id="tipo-evento-options">
                                        <option value="Reunião Presencial" />
                                        <option value="Videoconferência" />
                                        <option value="Visita Técnica" />
                                        <option value="Vistoria" />
                                        <option value="Fechamento de Contrato" />
                                        <option value="Acompanhamento de Obra" />
                                    </datalist>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Início (Horário)</label>
                                        <input required type="datetime-local" step="1800" value={getLocalString(formData.dataInicio)} onChange={e => {
                                            // Ao mudar local, converte para ISO UTC e injeta
                                            const v = e.target.value;
                                            if (v) {
                                                const dt = new Date(v);
                                                // Arredondar para o bloco de 30 min mais proximo para forçar step programático caso browser não respeite
                                                const mins = dt.getMinutes();
                                                dt.setMinutes(mins < 15 ? 0 : (mins < 45 ? 30 : 60));
                                                setFormData({ ...formData, dataInicio: dt.toISOString() });
                                            }
                                        }} className="w-full p-2 border rounded" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Duração</label>
                                        <select value={duracaoMinutos} onChange={e => setDuracaoMinutos(Number(e.target.value))} className="w-full p-2 border rounded">
                                            <option value={30}>30 min</option>
                                            <option value={60}>1 hora</option>
                                            <option value={90}>1h 30m</option>
                                            <option value={120}>2 horas</option>
                                            <option value={180}>3 horas</option>
                                            <option value={240}>4 horas</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Responsável</label>
                                <select value={formData.responsavel || ''} onChange={e => setFormData({ ...formData, responsavel: e.target.value })} className="w-full p-2 border rounded">
                                    <option value="">Selecione um funcionário...</option>
                                    <option value="Eu Mesm(a)">Eu Mesm(a)</option>
                                    {teamMembers.map(tm => (
                                        <option key={tm.id} value={tm.name}>{tm.name} - {tm.role}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição</label>
                                <textarea rows={3} value={formData.descricao || ''} onChange={e => setFormData({ ...formData, descricao: e.target.value })} className="w-full p-2 border rounded" placeholder="Anotações do evento..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Prioridade</label>
                                    <select value={formData.prioridade || 'MEDIA'} onChange={e => setFormData({ ...formData, prioridade: e.target.value as any })} className="w-full p-2 border rounded">
                                        <option value="BAIXA">Baixa</option>
                                        <option value="MEDIA">Média</option>
                                        <option value="ALTA">Alta</option>
                                    </select>
                                </div>
                                <div className="flex items-center mt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.eventoCritico || false} onChange={e => setFormData({ ...formData, eventoCritico: e.target.checked })} className="rounded text-[#c79229] focus:ring-[#c79229]" />
                                        <span className="text-sm font-medium text-red-600">Evento Crítico</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-[#c79229] text-[#181418] hover:bg-[#a67a21] rounded font-bold">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
