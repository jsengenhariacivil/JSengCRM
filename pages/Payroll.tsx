import React, { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, User, Calculator, Save, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePayroll } from '../context/PayrollContext';
import { PayrollCalculatorService } from '../services/payroll/PayrollCalculatorService';
import { AttendanceService } from '../services/payroll/AttendanceService';
import { AttendanceRecord, AttendanceStatus, PayrollResult } from '../types';

export const Payroll: React.FC = () => {
  const { teamMembers } = useData();
  const { workSchedules, attendanceRecords, saveAttendanceGrid } = usePayroll();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [periodStart, setPeriodStart] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [periodEnd, setPeriodEnd] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const [grid, setGrid] = useState<AttendanceRecord[]>([]);

  // Dados calculados
  const employee = useMemo(() => teamMembers.find(t => t.id === selectedEmployeeId), [teamMembers, selectedEmployeeId]);
  const schedule = useMemo(() => employee?.schedule_id ? workSchedules.find(s => s.id === employee.schedule_id) : undefined, [employee, workSchedules]);

  // Atualizar grid sempre que funcionário ou período mudar
  useEffect(() => {
    if (employee && schedule && periodStart && periodEnd) {
      const recordsInRange = attendanceRecords.filter(r => 
        r.employee_id === employee.id && 
        r.date >= periodStart && 
        r.date <= periodEnd
      );
      const newGrid = AttendanceService.generateAttendanceGrid(employee.id, periodStart, periodEnd, schedule, recordsInRange);
      setGrid(newGrid);
    } else {
      setGrid([]);
    }
  }, [employee, schedule, periodStart, periodEnd, attendanceRecords]);

  const handleStatusChange = (index: number, newStatus: AttendanceStatus) => {
    const newGrid = [...grid];
    newGrid[index] = { ...newGrid[index], status: newStatus };
    setGrid(newGrid);
  };

  const handleSaveGrid = async () => {
    await saveAttendanceGrid(grid);
    alert('Frequência salva com sucesso!');
  };

  // Cálculo em tempo real
  const result: PayrollResult | null = useMemo(() => {
    if (!employee || !schedule || !periodStart || !periodEnd) return null;
    return PayrollCalculatorService.calculate(employee, schedule, periodStart, periodEnd, grid);
  }, [employee, schedule, periodStart, periodEnd, grid]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="text-[#c79229]" />
            Folha de Pagamento
          </h1>
          <p className="text-slate-500">Geração de folha e controle de frequência</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FILTROS */}
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200 col-span-1 h-fit space-y-4">
          <h2 className="font-semibold text-slate-800 mb-4 border-b pb-2">Parâmetros</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Funcionário</label>
            <select 
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
              value={selectedEmployeeId}
              onChange={e => setSelectedEmployeeId(e.target.value)}
            >
              <option value="">Selecione um funcionário</option>
              {teamMembers.filter(t => t.type === 'CLT' || t.type === 'Funcionário').map(t => (
                <option key={t.id} value={t.id}>{t.name} - {t.role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Período Inicial</label>
            <input 
              type="date"
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white outline-none"
              value={periodStart}
              onChange={e => setPeriodStart(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Período Final</label>
            <input 
              type="date"
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white outline-none"
              value={periodEnd}
              onChange={e => setPeriodEnd(e.target.value)}
            />
          </div>

          {employee && !schedule && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm mt-4">
              <strong>Atenção:</strong> O funcionário selecionado não possui uma Escala de Trabalho vinculada. Edite o cadastro em Equipe para continuar.
            </div>
          )}
        </div>

        {/* ESPELHO E RESULTADO */}
        {employee && schedule && result && (
          <div className="md:col-span-2 space-y-6">
            
            {/* QUADRO DE FREQUÊNCIA */}
            <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarIcon size={18} className="text-blue-600"/>
                  Frequência do Período
                </h2>
                <button 
                  onClick={handleSaveGrid}
                  className="flex items-center gap-2 bg-[#181418] hover:bg-black text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  <Save size={16} /> Salvar Frequência
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 border-b">Data</th>
                      <th className="px-4 py-2 border-b">Dia da Semana</th>
                      <th className="px-4 py-2 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grid.map((r, i) => {
                      const d = new Date(`${r.date}T00:00:00`);
                      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
                      const formattedDate = d.toLocaleDateString('pt-BR');
                      return (
                        <tr key={r.id || r.date} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium text-slate-700">{formattedDate}</td>
                          <td className="px-4 py-2 text-slate-500 capitalize">{weekday}</td>
                          <td className="px-4 py-2">
                            <select 
                              className={`border rounded p-1 outline-none text-sm font-medium ${r.status === 'Falta' ? 'bg-red-50 text-red-700 border-red-200' : r.status === 'Presente' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600'}`}
                              value={r.status}
                              onChange={e => handleStatusChange(i, e.target.value as AttendanceStatus)}
                            >
                              <option value="Presente">Presente</option>
                              <option value="Falta">Falta</option>
                              <option value="Falta Justificada">Falta Justificada</option>
                              <option value="Atestado">Atestado</option>
                              <option value="Folga">Folga</option>
                              <option value="Férias">Férias</option>
                              <option value="Licença">Licença</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* HOLERITE / RESULTADO */}
            <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
              <div className="bg-[#181418] text-white p-4">
                <h2 className="font-semibold text-lg">Resumo da Folha (Tempo Real)</h2>
                <p className="text-slate-400 text-sm">{employee.name} • Escala: {schedule.name}</p>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-slate-700 mb-3 border-b pb-2">Dias</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-slate-500">Dias Previstos de Trabalho:</span>
                      <span className="font-medium text-slate-800">{result.expected_days}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500">Dias Efetivamente Trabalhados:</span>
                      <span className="font-medium text-slate-800">{result.worked_days}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500">Faltas:</span>
                      <span className="font-medium text-red-600">{result.absences}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500">Faltas Justificadas:</span>
                      <span className="font-medium text-slate-800">{result.justified_absences}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500">Atestados:</span>
                      <span className="font-medium text-slate-800">{result.medical_certificates}</span>
                    </li>
                  </ul>

                  <h3 className="font-semibold text-slate-700 mt-6 mb-3 border-b pb-2">Base Financeira</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-slate-500">Salário Base:</span>
                      <span className="font-medium text-slate-800">R$ {result.base_salary.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500">Valor Diário (Bruto / Dias Previstos):</span>
                      <span className="font-medium text-blue-600">R$ {result.daily_rate.toFixed(2)}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-700 mb-3 border-b pb-2">Proventos e Descontos</h3>
                  <ul className="space-y-2 text-sm">
                    {result.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className={item.type === 'Desconto' ? 'text-red-500' : 'text-slate-600'}>{item.description}:</span>
                        <span className={`font-medium ${item.type === 'Desconto' ? 'text-red-600' : 'text-green-600'}`}>
                          {item.type === 'Desconto' ? '-' : '+'} R$ {item.amount.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-4 border-t-2 border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-500 font-medium">Remuneração Bruta:</span>
                      <span className="text-slate-800 font-semibold">R$ {result.gross_remuneration.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-500 font-medium">Total Descontos:</span>
                      <span className="text-red-600 font-semibold">- R$ {result.total_discounts.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-slate-800 font-bold">Valor Líquido:</span>
                      <span className="text-[#c79229] font-bold text-xl">R$ {result.net_value.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;
