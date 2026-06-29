import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Clock, Plus, Trash2, X, Printer } from 'lucide-react';
import { TimePunch, TeamMember } from '../types';

interface PontoModalProps {
  employee: TeamMember;
  onClose: () => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function calcHours(entry: string, exit: string): number {
  if (!entry || !exit) return 0;
  if (entry === '00:00' && exit === '00:00') return 0; // Falta
  const [eh, em] = entry.split(':').map(Number);
  const [xh, xm] = exit.split(':').map(Number);
  let total = (xh * 60 + xm - (eh * 60 + em)) / 60;
  
  if (entry === '07:00' && exit === '16:30') return 8; // 1.5h lunch break
  if (entry === '08:00' && exit === '17:00') return 8; // 1h lunch break
  if (total > 6) total -= 1; // fallback default lunch break
  return Math.max(0, total);
}

function calcWorkingDaysInMonth(year: number, month: number, schedule: string) {
  let count = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month - 1, i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0) { // Not Sunday
      if (schedule === 'seg_sex' && dayOfWeek === 6) continue;
      count++;
    }
  }
  return count;
}

function calculateDailyValue(emp: TeamMember, dateStr: string) {
  // Se o funcionário tem salário base cadastrado ou é do tipo CLT
  if (['CLT', 'Funcionário', 'FUNCIONARIO', 'clt'].includes(emp.type?.trim() || '') || Number(emp.base_salary) > 0) {
    const dateObj = new Date(dateStr + 'T12:00:00');
    const workingDays = calcWorkingDaysInMonth(dateObj.getFullYear(), dateObj.getMonth() + 1, emp.work_schedule || 'seg_sex');
    
    const salary = Number(emp.base_salary) || 0;
    const bonus = Number(emp.bonus) || 0;
    const cesta = Number(emp.cesta_basica) || 0;
    
    const fixedMonthly = salary + bonus + cesta;
    const dailySalary = workingDays > 0 ? (fixedMonthly / workingDays) : 0;
    
    const lunch = Number(emp.lunch_allowance) || 0;
    const breakfast = Number(emp.breakfast_allowance) || 0;
    
    const total = dailySalary + lunch + breakfast;
    return Math.round(total * 100) / 100;
  }
  return Number(emp.dailyRate) || 0;
}

export default function PontoModal({ employee, onClose }: PontoModalProps) {
  const { timePunches, addTimePunch, updateTimePunch, deleteTimePunch } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyPunch: Omit<TimePunch, 'id'> = {
    employee_id: employee.id,
    date: new Date().toISOString().split('T')[0],
    entry_time: '07:00',
    exit_time: '17:00',
    hours_worked: 10,
    value_paid: calculateDailyValue(employee, new Date().toISOString().split('T')[0]),
    note: '',
  };

  const [form, setForm] = useState(emptyPunch);

  React.useEffect(() => {
    if (!editingId && form.date) {
      if (form.entry_time === '00:00' && form.exit_time === '00:00') {
        setForm(prev => ({ ...prev, value_paid: 0 }));
      } else {
        setForm(prev => ({ ...prev, value_paid: calculateDailyValue(employee, form.date) }));
      }
    }
  }, [form.date, form.entry_time, form.exit_time, editingId, employee]);

  const punches = timePunches.filter(p => p.employee_id === employee.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const hours = calcHours(form.entry_time, form.exit_time);
    
    if (editingId) {
      await updateTimePunch(editingId, { ...form, hours_worked: hours });
    } else {
      // Impede duplicata: mesmo funcionário + mesma data
      const duplicate = punches.some(p => p.date === form.date);
      if (duplicate) {
        alert(`Já existe um registro de ponto para a data ${new Date(form.date + 'T00:00:00').toLocaleDateString('pt-BR')}. Edite o registro existente ou escolha outra data.`);
        return;
      }
      await addTimePunch({ ...form, hours_worked: hours });
    }
    
    setForm(emptyPunch);
    setEditingId(null);
  };

  const handleEdit = (p: TimePunch) => {
    setEditingId(p.id);
    setForm({
      employee_id: p.employee_id,
      date: p.date,
      entry_time: p.entry_time,
      exit_time: p.exit_time,
      hours_worked: p.hours_worked,
      value_paid: p.value_paid,
      note: p.note
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[60] p-4 py-8 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 mt-0 sm:mt-10">
        
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Ponto / Atividades</h2>
              <p className="text-xs text-zinc-500">{employee.name} • {employee.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSave} className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
              {editingId ? <Clock size={16} className="text-blue-500" /> : <Clock size={16} className="text-emerald-500" />}
              {editingId ? 'Editar Ponto' : 'Registrar Novo Ponto'}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data</label>
                <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Entrada</label>
                <input required type="time" value={form.entry_time} onChange={e => setForm({...form, entry_time: e.target.value})} className="w-full px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Saída</label>
                <input required type="time" value={form.exit_time} onChange={e => setForm({...form, exit_time: e.target.value})} className="w-full px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Obs (Opcional)</label>
                <input type="text" placeholder="Ex: Falta, Atraso..." value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="w-full px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white" />
              </div>
            </div>

            {/* Quick Fill Options */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                type="button" 
                onClick={() => setForm({...form, entry_time: '07:00', exit_time: '16:30', note: 'Local (07:00 - 16:30)'})}
                className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                Dia Normal (Local)
              </button>
              <button 
                type="button" 
                onClick={() => setForm({...form, entry_time: '08:00', exit_time: '17:00', note: 'Condomínio (08:00 - 17:00)'})}
                className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Condomínio
              </button>
              <button 
                type="button" 
                onClick={() => setForm({...form, entry_time: '00:00', exit_time: '00:00', note: 'FALTA', value_paid: 0})}
                className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
              >
                Marcar Falta
              </button>
            </div>

            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Valor (R$)</label>
                <input required type="number" min="0" step="0.01" value={form.value_paid || ''} onChange={e => setForm({...form, value_paid: Number(e.target.value)})} className="w-full px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white" />
              </div>
              <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
                Salvar
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm(emptyPunch); }} className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg">
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
              <thead className="bg-gray-50 dark:bg-zinc-800/80 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-zinc-700">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Horário</th>
                  <th className="px-4 py-3">Horas</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {punches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum registro encontrado.</td>
                  </tr>
                ) : (
                  punches.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{p.entry_time} às {p.exit_time}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{p.hours_worked.toFixed(1)}h</td>
                      <td className="px-4 py-3 whitespace-nowrap text-emerald-600 dark:text-emerald-400 font-medium">{fmt(p.value_paid)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => handleEdit(p)} className="p-1 text-gray-400 hover:text-blue-500 transition-colors mr-2"><Plus size={16} /></button>
                        <button onClick={async () => { if (window.confirm('Excluir este ponto?')) await deleteTimePunch(p.id); }} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
