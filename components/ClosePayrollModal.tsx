import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import { TeamMember, TimePunch } from '../types';
import { useData } from '../context/DataContext';

interface ClosePayrollModalProps {
  employees: TeamMember[];
  onClose: () => void;
}

export default function ClosePayrollModal({ employees, onClose }: ClosePayrollModalProps) {
  const { timePunches, addPayment, payments } = useData();
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

  const calculateEmployeePayroll = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return { sum: 0, punchesFound: 0, workingDaysCount: 0 };

    const punches = timePunches.filter(p =>
      p.employee_id === empId &&
      p.date >= startDate &&
      p.date <= endDate
    );

    const workingPunches = punches.filter(
      p => !(p.entry_time === '00:00' && p.exit_time === '00:00')
    );
    const workingDaysInPeriod = workingPunches.length;

    let sum = 0;
    if (
      ['CLT', 'Funcionário', 'FUNCIONARIO', 'clt'].includes(emp.type?.trim() || '') ||
      Number(emp.base_salary) > 0
    ) {
      const salary    = Number(emp.base_salary) || 0;
      const bonus     = Number(emp.bonus) || 0;
      const cesta     = Number(emp.cesta_basica) || 0;
      const lunch     = Number(emp.lunch_allowance) || 0;
      const breakfast = Number(emp.breakfast_allowance) || 0;

      const fixedMonthly = salary + bonus + cesta;
      sum = fixedMonthly + (lunch + breakfast) * workingDaysInPeriod;
    } else {
      sum = workingPunches.reduce((acc, curr) => {
        const val = Number(curr.value_paid);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
    }

    return { 
      sum: Math.round(sum * 100) / 100, 
      punchesFound: punches.length, 
      workingDaysCount: workingDaysInPeriod 
    };
  };

  // Calcula sempre que mudar a seleção
  useEffect(() => {
    if (employeeId && startDate && endDate) {
      if (employeeId === 'all') {
        const activeEmps = employees.filter(e => e.status === 'Ativo');
        let totalSum = 0;
        let totalPunches = 0;
        let totalWorkingDays = 0;
        
        activeEmps.forEach(emp => {
          const res = calculateEmployeePayroll(emp.id);
          totalSum += res.sum;
          totalPunches += res.punchesFound;
          totalWorkingDays += res.workingDaysCount;
        });
        
        setTotalValue(Math.round(totalSum * 100) / 100);
        setPunchesFound(totalPunches);
        setWorkingDaysCount(totalWorkingDays);
      } else {
        const res = calculateEmployeePayroll(employeeId);
        setTotalValue(res.sum);
        setPunchesFound(res.punchesFound);
        setWorkingDaysCount(res.workingDaysCount);
      }
    } else {
      setTotalValue(0);
      setPunchesFound(0);
      setWorkingDaysCount(0);
    }
  }, [employeeId, startDate, endDate, timePunches, employees]);

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || totalValue <= 0) return;
    
    // Converte datas para criar uma referência bacana
    const startStr = startDate.split('-').reverse().join('/');
    const endStr = endDate.split('-').reverse().join('/');
    const referenceText = `Fechamento de Folha (${startStr} a ${endStr})`;

    if (employeeId === 'all') {
      const activeEmps = employees.filter(e => e.status === 'Ativo');
      let gerados = 0;
      let pulados = 0;

      for (const emp of activeEmps) {
        const res = calculateEmployeePayroll(emp.id);
        if (res.sum > 0) {
          const jaExiste = payments.some(p => p.name === emp.name && p.reference === referenceText);
          if (jaExiste) {
            pulados++;
            continue;
          }

          await addPayment({
            name: emp.name,
            reference: referenceText,
            date: endDate,
            value: res.sum,
            status: 'Pendente'
          } as any);
          gerados++;
        }
      }
      alert(`Processo concluído!\n\n✅ ${gerados} lançamentos criados.\n⚠️ ${pulados} ignorados (já existiam no financeiro para o período).`);
    } else {
      const emp = employees.find(e => e.id === employeeId);
      if (!emp) return;

      const jaExiste = payments.some(p => p.name === emp.name && p.reference === referenceText);
      if (jaExiste) {
        alert(`Atenção: Já existe um lançamento de folha para ${emp.name} neste mesmo período no Financeiro! Ação cancelada.`);
        return;
      }

      await addPayment({
        name: emp.name,
        reference: referenceText,
        date: endDate,
        value: totalValue,
        status: 'Pendente'
      } as any);
      alert('Lançamento criado com sucesso no Financeiro!');
    }

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
                <option value="all" className="bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold">🌟 Todos os Ativos (Lote)</option>
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
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                {employeeId === 'all' ? 'Resumo Geral (Lote de Todos)' : 'Resumo do Período'}
              </h4>
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
              {employeeId === 'all' ? 'Gerar Lote p/ Financeiro' : 'Confirmar e Enviar p/ Financeiro'}
            </button>
            
          </div>
        </form>

      </div>
    </div>
  );
}
