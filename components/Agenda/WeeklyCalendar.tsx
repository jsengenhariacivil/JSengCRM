import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AgendaEvento } from '../../types';

interface WeeklyCalendarProps {
    events: AgendaEvento[];
    onEventClick: (event: AgendaEvento) => void;
    getPriorityColor: (prioridade: string | undefined) => string;
}

export default function WeeklyCalendar({ events, onEventClick, getPriorityColor }: WeeklyCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day; // Adjust to Sunday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const startOfWeek = getStartOfWeek(currentDate);

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [startOfWeek]);

    const nextWeek = () => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 7);
        setCurrentDate(next);
    };

    const prevWeek = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 7);
        setCurrentDate(prev);
    };

    const today = () => setCurrentDate(new Date());

    // Hours to show (e.g. 07:00 to 18:00)
    const HOURS = Array.from({ length: 12 }, (_, i) => i + 7);

    // Group events by day (0 to 6) and by hour (0 to 23)
    const getEventsForSlot = (dayDate: Date, hour: number) => {
        return events.filter(e => {
            if (!e.dataInicio) return false;
            const ed = new Date(e.dataInicio);
            return ed.getFullYear() === dayDate.getFullYear() &&
                ed.getMonth() === dayDate.getMonth() &&
                ed.getDate() === dayDate.getDate() &&
                ed.getHours() === hour;
        });
    };

    // Some events just have dates without specific times (like 00:00:00).
    // We should render them at the top of the day, as "All-day" events.
    const getAllDayEvents = (dayDate: Date) => {
        return events.filter(e => {
            if (!e.dataInicio) return false;
            const ed = new Date(e.dataInicio);
            return ed.getFullYear() === dayDate.getFullYear() &&
                ed.getMonth() === dayDate.getMonth() &&
                ed.getDate() === dayDate.getDate() &&
                ed.getHours() === 0;
        });
    };

    const getModuleColor = (origem: string) => {
        switch (origem) {
            case 'OBRA': return 'border-[#c79229] bg-[#c79229]/10 text-[#181418]';
            case 'ORCAMENTO': return 'border-emerald-500 bg-emerald-50 text-emerald-800';
            case 'FINANCEIRO': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
            default: return 'border-gray-500 bg-gray-50 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border flex flex-col h-[700px]">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50 rounded-t-xl">
                <h2 className="text-lg font-bold text-slate-800">
                    {startOfWeek.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={today} className="px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-white bg-slate-100 transition-colors">Hoje</button>
                    <div className="flex bg-slate-100 rounded-md border">
                        <button onClick={prevWeek} className="p-1.5 hover:bg-white rounded-l-md transition-colors"><ChevronLeft size={20} /></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onClick={nextWeek} className="p-1.5 hover:bg-white rounded-r-md transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex">
                {/* Timeline Axis */}
                <div className="w-16 flex-shrink-0 border-r bg-slate-50/50">
                    <div className="h-28 border-b"></div> {/* Header spacer for All-Day */}
                    {HOURS.map(hour => (
                        <div key={hour} className="h-24 border-b border-slate-100 p-2 text-right relative">
                            <span className="text-xs font-medium text-slate-400 absolute -top-2.5 right-2 bg-slate-50 px-1">{hour.toString().padStart(2, '0')}:00</span>
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                <div className="flex-1 flex min-w-[800px]">
                    {weekDays.map((dayDate, i) => {
                        const isToday = dayDate.toDateString() === new Date().toDateString();
                        const allDayEvents = getAllDayEvents(dayDate);

                        return (
                            <div key={i} className={`flex-1 min-w-0 border-r ${isToday ? 'bg-[#c79229]/5' : ''}`}>
                                <div className={`h-28 border-b flex flex-col p-2 top-0 bg-white z-10 sticky`}>
                                    <div className="text-center mb-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase">{dayDate.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                                        <p className={`text-xl font-bold mt-0.5 ${isToday ? 'text-[#c79229]' : 'text-[#181418]'}`}>{dayDate.getDate()}</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1">
                                        {allDayEvents.map(ev => (
                                            <div
                                                key={ev.id}
                                                onClick={() => onEventClick(ev)}
                                                className={`text-xs px-2 py-1 rounded cursor-pointer truncate border-l-2 hover:opacity-80 transition-opacity ${getModuleColor(ev.origemModulo)}`}
                                                title={ev.titulo}
                                            >
                                                {ev.titulo}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Hourly Slots */}
                                {HOURS.map(hour => {
                                    const hourEvents = getEventsForSlot(dayDate, hour);
                                    return (
                                        <div key={hour} className="h-24 border-b border-slate-100 relative p-1">
                                            <div className="w-full h-full flex flex-col gap-1 overflow-y-auto pr-1">
                                                {hourEvents.map(ev => (
                                                    <div
                                                        key={ev.id}
                                                        onClick={() => onEventClick(ev)}
                                                        className={`text-xs p-1.5 rounded-md cursor-pointer border hover:shadow-md transition-shadow flex flex-col gap-1 ${getModuleColor(ev.origemModulo)}`}
                                                        title={ev.titulo}
                                                    >
                                                        <span className="font-semibold truncate">{ev.titulo}</span>
                                                        {ev.responsavel && <span className="truncate opacity-80">{ev.responsavel}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
