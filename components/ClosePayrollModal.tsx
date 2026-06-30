import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import { TeamMember } from '../types';
import { useData } from '../context/DataContext';
import { usePayroll } from '../context/PayrollContext';
import { PayrollCalculatorService } from '../services/payroll/PayrollCalculatorService';
import { AttendanceService } from '../services/payroll/AttendanceService';

interface ClosePayrollModalProps {
  employees: TeamMember[];
  onClose: () => void;
}

export default function ClosePayrollModal({ employees, onClose }: ClosePayrollModalProps) {
  const { addPayment, payments } = useData();
  const { workSchedules, attendanceRecords } = usePayroll();
  
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(5);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 4);
    return d.toISOString().split('T')[0];
  });
  
  const [totals, setTotals] = useState({
    bruto: 0,
    adiantamento: 0,
    fechamento: 0,
    trabalhados: 0,
    faltas: 0
  });

  const calculateEmployeePayroll = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp || !emp.schedule_id) return null;
    
    const schedule = workSchedules.find(s => s.id === emp.schedule_id);
    if (!schedule) return null;

    const recordsInRange = attendanceRecords.filter(r => 
      r.employee_id === emp.id && 
      r.date >= startDate && 
      r.date <= endDate
    );
    
    const grid = AttendanceService.generateAttendanceGrid(emp.id, startDate, endDate, schedule, recordsInRange);
    return PayrollCalculatorService.calculate(emp, schedule, startDate, endDate, grid);
  };

  useEffect(() => {
    if (employeeId && startDate && endDate) {
      if (employeeId === 'all') {
        const activeEmps = employees.filter(e => e.status === 'Ativo');
        let tBruto = 0, tAdiantamento = 0, tFechamento = 0, tTrabalhados = 0, tFaltas = 0;
        
        activeEmps.forEach(emp => {
          const res = calculateEmployeePayroll(emp.id);
          if (res) {
            tBruto += res.gross_remuneration;
            tAdiantamento += res.adiantamento_value;
            tFechamento += res.fechamento_value;
            tTrabalhados += res.worked_days;
            tFaltas += res.absences;
          }
        });
        
        setTotals({ bruto: tBruto, adiantamento: tAdiantamento, fechamento: tFechamento, trabalhados: tTrabalhados, faltas: tFaltas });
      } else {
        const res = calculateEmployeePayroll(employeeId);
        if (res) {
          setTotals({ 
            bruto: res.gross_remuneration, 
            adiantamento: res.adiantamento_value, 
            fechamento: res.fechamento_value, 
            trabalhados: res.worked_days, 
            faltas: res.absences 
          });
        } else {
          setTotals({ bruto: 0, adiantamento: 0, fechamento: 0, trabalhados: 0, faltas: 0 });
        }
      }
    } else {
      setTotals({ bruto: 0, adiantamento: 0, fechamento: 0, trabalhados: 0, faltas: 0 });
    }
  }, [employeeId, startDate, endDate, workSchedules, attendanceRecords, employees]);

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || totals.bruto <= 0) return;
    
    const startStr = startDate.split('-').reverse().join('/');
    const endStr = endDate.split('-').reverse().join('/');
    
    const startObj = new Date(`${startDate}T00:00:00`);
    
    const adiantamentoDate = new Date(startObj.getFullYear(), startObj.getMonth(), 20).toISOString().split('T')[0];
    const fechamentoDate = new Date(startObj.getFullYear(), startObj.getMonth() + 1, 5).toISOString().split('T')[0];

    if (employeeId === 'all') {
      const activeEmps = employees.filter(e => e.status === 'Ativo');
      let gerados = 0;
      let pulados = 0;

      for (const emp of activeEmps) {
        const res = calculateEmployeePayroll(emp.id);
        if (res && res.gross_remuneration > 0) {
          const refAdiantamento = `Adiantamento Folha (${startStr} a ${endStr})`;
          const refFechamento = `Fechamento Folha (${startStr} a ${endStr})`;
          
          const existeAdiantamento = payments.some(p => p.name === emp.name && p.reference === refAdiantamento);
          const existeFechamento = payments.some(p => p.name === emp.name && p.reference === refFechamento);
          
          if (existeAdiantamento && existeFechamento) {
            pulados++;
            continue;
          }

          if (res.adiantamento_value > 0 && !existeAdiantamento) {
            await addPayment({
              name: emp.name,
              reference: refAdiantamento,
              date: adiantamentoDate,
              value: res.adiantamento_value,
              status: 'Pendente'
            } as any);
          }

          if (res.fechamento_value > 0 && !existeFechamento) {
            await addPayment({
              name: emp.name,
              reference: refFechamento,
              date: fechamentoDate,
              value: res.fechamento_value,
              status: 'Pendente'
            } as any);
          }
          
          gerados++;
        }
      }
      alert(`Processo concluído!\n\n✅ ${gerados} funcionários processados com adiantamento e fechamento.\n⚠️ ${pulados} ignorados (já existiam no financeiro).`);
    } else {
      const emp = employees.find(e => e.id === employeeId);
      if (!emp) return;

      const res = calculateEmployeePayroll(emp.id);
      if (!res) return;

      const refAdiantamento = `Adiantamento Folha (${startStr} a ${endStr})`;
      const refFechamento = `Fechamento Folha (${startStr} a ${endStr})`;

      const existeAdiantamento = payments.some(p => p.name === emp.name && p.reference === refAdiantamento);
      const existeFechamento = payments.some(p => p.name === emp.name && p.reference === refFechamento);

      if (existeAdiantamento && existeFechamento) {
        alert(`Atenção: Já existem lançamentos para ${emp.name} neste período!`);
        return;
      }

      if (res.adiantamento_value > 0 && !existeAdiantamento) {
        await addPayment({
          name: emp.name,
          reference: refAdiantamento,
          date: adiantamentoDate,
          value: res.adiantamento_value,
          status: 'Pendente'
        } as any);
      }

      if (res.fechamento_value > 0 && !existeFechamento) {
        await addPayment({
          name: emp.name,
          reference: refFechamento,
          date: fechamentoDate,
          value: res.fechamento_value,
          status: 'Pendente'
        } as any);
      }

      alert('Lançamentos de Adiantamento e Fechamento criados com sucesso no Financeiro!');
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
              <p className="text-xs text-zinc-500">Gera lançamentos no Financeiro</p>
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
                <span className="text-blue-600 dark:text-blue-400">Dias trabalhados:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{totals.trabalhados} dias</span>
              </div>
              {totals.faltas > 0 && (
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-blue-600 dark:text-blue-400">Faltas:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{totals.faltas} dias</span>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/50">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Adiantamento (Dia 20):</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.adiantamento)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Fechamento (Dia 05):</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.fechamento)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-lg pt-2 border-t border-blue-300 dark:border-blue-800">
                  <span className="text-blue-700 dark:text-blue-400 font-bold">Total a Pagar:</span>
                  <span className="font-bold text-blue-900 dark:text-blue-100">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.bruto)}
                  </span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={totals.bruto <= 0 || !employeeId}
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
