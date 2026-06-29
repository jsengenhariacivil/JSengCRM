import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import { TeamMember, TimePunch } from '../types';
import { useData } from '../context/DataContext';

interface ClosePayrollModalProps {
  employees: TeamMember[];
  onClose: () => void;
}

export default function ClosePayrollModal({ employees, onClose }: ClosePayrollModalProps) {
  const { timePunches, addPayment } = useData();
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 0);
    return d.toISOString().split('T')[0];
  });
  
  const [totalValue, setTotalValue] = useState(0);
  const [punchesFound, setPunchesFound] = useState(0);
  const [workingDaysCount, setWorkingDaysCount] = useState(0);

  // Calcula sempre que mudar a seleção
  useEffect(() => {
    if (employeeId && startDate && endDate) {
      const emp = employees.find(e => e.id === employeeId);
      const punches = timePunches.filter(p =>
        p.employee_id === employeeId &&
        p.date >= startDate &&
        p.date <= endDate
      );
      setPunchesFound(punches.length);

      // Dias efetivamente trabalhados (exclui faltas marcadas como 00:00)
      const workingPunches = punches.filter(
        p => !(p.entry_time === '00:00' && p.exit_time === '00:00')
      );
      const workingDaysInPeriod = workingPunches.length;
      setWorkingDaysCount(workingDaysInPeriod);

      let sum = 0;

      if (emp && (
        ['CLT', 'Funcionário', 'FUNCIONARIO', 'clt'].includes(emp.type?.trim() || '') ||
        Number(emp.base_salary) > 0
      )) {
        // CLT: salário fixo pelo período + benefícios diários × dias trabalhados
        const salary    = Number(emp.base_salary) || 0;
        const bonus     = Number(emp.bonus) || 0;
        const cesta     = Number(emp.cesta_basica) || 0;
        const lunch     = Number(emp.lunch_allowance) || 0;
        const breakfast = Number(emp.breakfast_allowance) || 0;

        const fixedMonthly = salary + bonus + cesta;
        sum = fixedMonthly + (lunch + breakfast) * workingDaysInPeriod;
      } else {
        // Diarista / Prestador: soma dos valores registrados por dia
        sum = workingPunches.reduce((acc, curr) => {
          const val = Number(curr.value_paid);
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
      }

      setTotalValue(Math.round(sum * 100) / 100);
    } else {
      setTotalValue(0);
      setPunchesFound(0);
    }
  }, [employeeId, startDate, endDate, timePunches, employees]);

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || totalValue <= 0) return;
    
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    // Converte datas para criar uma referência bacana
    const startStr = startDate.split('-').reverse().join('/');
    const endStr = endDate.split('-').reverse().join('/');

    await addPayment({
      name: emp.name,
      reference: `Fechamento de Folha (${startStr} a ${endStr})`,
      date: endDate,
      value: totalValue,
      status: 'Pendente'
    } as any);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 py-8 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl mt-0 sm:mt-10 border border-gray-200 dark:border-zinc-800">
        
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Fechar Folha</h2>
              <p className="text-xs text-zinc-500">Gera um contas a pagar no Financeiro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleClose} className="p-6">
          <div className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Funcionário</label>
              <select 
                required
                value={employeeId} 
                onChange={e => setEmployeeId(e.target.value)} 
                className="w-full border border-slate-300 dark:border-zinc-700 rounded-lg p-3 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#c79229] outline-none"
              >
                <option value="" className="bg-white text-slate-900 dark:bg-zinc-800 dark:text-white">Selecione...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-white text-slate-900 dark:bg-zinc-800 dark:text-white">{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Início</label>
                <input 
                  required
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  className="w-full border border-slate-300 dark:border-zinc-700 rounded-lg p-3 bg-slate-50 dark:bg-zinc-800 dark:text-white focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Fim</label>
                <input 
                  required
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  className="w-full border border-slate-300 dark:border-zinc-700 rounded-lg p-3 bg-slate-50 dark:bg-zinc-800 dark:text-white focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">Resumo do Período</h4>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-blue-600 dark:text-blue-400">Total de registros:</span>
                <span className="font-bold text-blue-900 dark:text-blue-100">{punchesFound} dias</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-blue-600 dark:text-blue-400">✅ Dias trabalhados:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{workingDaysCount} dias</span>
              </div>
              {punchesFound - workingDaysCount > 0 && (
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-blue-600 dark:text-blue-400">❌ Faltas:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{punchesFound - workingDaysCount} dias</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                <span className="text-blue-600 dark:text-blue-400 font-bold">Total a Pagar:</span>
                <span className="font-bold text-blue-900 dark:text-blue-100">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={totalValue <= 0 || !employeeId}
              className="w-full py-3 bg-[#c79229] hover:bg-[#a67922] disabled:opacity-50 text-[#181418] font-bold rounded-lg transition-colors mt-6"
            >
              Confirmar e Enviar p/ Financeiro
            </button>
            
          </div>
        </form>

      </div>
    </div>
  );
}
