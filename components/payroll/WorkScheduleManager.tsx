import React, { useState } from 'react';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { usePayroll } from '../../context/PayrollContext';
import { WorkSchedule } from '../../types';

export const WorkScheduleManager: React.FC = () => {
  const { workSchedules, addWorkSchedule, updateWorkSchedule, deleteWorkSchedule } = usePayroll();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<WorkSchedule>>({
    name: '',
    description: '',
    is_active: true,
    consider_holidays_as_workdays: false,
    work_monday: true,
    work_tuesday: true,
    work_wednesday: true,
    work_thursday: true,
    work_friday: true,
    work_saturday: false,
    work_sunday: false,
    start_time: '08:00',
    end_time: '18:00',
    break_duration: 60
  });

  const handleEdit = (schedule: WorkSchedule) => {
    setEditingId(schedule.id);
    setFormData(schedule);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta escala? Ela pode estar sendo usada por funcionários.')) {
      deleteWorkSchedule(id);
    }
  };

  const handleSave = async () => {
    if (!formData.name) return alert('Nome da escala é obrigatório');

    if (editingId && editingId !== 'new') {
      await updateWorkSchedule({ ...formData, id: editingId } as WorkSchedule);
    } else {
      await addWorkSchedule({
        ...formData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      } as WorkSchedule);
    }

    setEditingId(null);
    setFormData({
      name: '', description: '', is_active: true, consider_holidays_as_workdays: false,
      work_monday: true, work_tuesday: true, work_wednesday: true, work_thursday: true,
      work_friday: true, work_saturday: false, work_sunday: false, start_time: '08:00',
      end_time: '18:00', break_duration: 60
    });
  };

  const handleCheckbox = (field: keyof WorkSchedule) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">Escalas de Trabalho</h2>
        {editingId === null && (
          <button 
            onClick={() => setEditingId('new')}
            className="flex items-center gap-2 bg-[#c79229] hover:bg-[#b07d1a] text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            <Plus size={16} /> Nova Escala
          </button>
        )}
      </div>

      <div className="p-4">
        {editingId && (
          <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <h3 className="font-semibold mb-4 text-slate-700">{editingId === 'new' ? 'Nova Escala' : 'Editar Escala'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Escala</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Seg a Sex"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  value={formData.description || ''} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário Início</label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  value={formData.start_time || ''} 
                  onChange={e => setFormData({...formData, start_time: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário Fim</label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  value={formData.end_time || ''} 
                  onChange={e => setFormData({...formData, end_time: e.target.value})}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Dias Trabalhados</label>
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'work_monday', label: 'Seg' },
                  { id: 'work_tuesday', label: 'Ter' },
                  { id: 'work_wednesday', label: 'Qua' },
                  { id: 'work_thursday', label: 'Qui' },
                  { id: 'work_friday', label: 'Sex' },
                  { id: 'work_saturday', label: 'Sáb' },
                  { id: 'work_sunday', label: 'Dom' },
                ].map(day => (
                  <label key={day.id} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border border-slate-200">
                    <input 
                      type="checkbox" 
                      checked={!!formData[day.id as keyof WorkSchedule]} 
                      onChange={() => handleCheckbox(day.id as keyof WorkSchedule)}
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!formData.is_active} 
                  onChange={() => handleCheckbox('is_active')}
                />
                <span className="text-sm font-medium text-slate-700">Escala Ativa</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!formData.consider_holidays_as_workdays} 
                  onChange={() => handleCheckbox('consider_holidays_as_workdays')}
                />
                <span className="text-sm font-medium text-slate-700">Trabalha em Feriados</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200">
              <button 
                onClick={() => setEditingId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <Check size={18} /> Salvar
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workSchedules.map(schedule => (
            <div key={schedule.id} className={`border rounded-lg p-4 relative ${!schedule.is_active ? 'opacity-60 bg-slate-50' : 'bg-white'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-800">{schedule.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(schedule)} className="p-1 text-slate-400 hover:text-blue-600"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(schedule.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">{schedule.description || 'Sem descrição'}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, i) => {
                  const keys: (keyof WorkSchedule)[] = ['work_monday', 'work_tuesday', 'work_wednesday', 'work_thursday', 'work_friday', 'work_saturday', 'work_sunday'];
                  const isWork = schedule[keys[i]];
                  return (
                    <span key={d} className={`text-[10px] px-1.5 py-0.5 rounded ${isWork ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                      {d}
                    </span>
                  )
                })}
              </div>

              <div className="text-sm text-slate-600 flex justify-between">
                <span>{schedule.start_time} - {schedule.end_time}</span>
                {schedule.consider_holidays_as_workdays && <span className="text-xs text-amber-600 font-medium">Trabalha Feriados</span>}
              </div>
            </div>
          ))}
          {workSchedules.length === 0 && !editingId && (
            <div className="col-span-full text-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              Nenhuma escala cadastrada. Clique em "Nova Escala" para começar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
