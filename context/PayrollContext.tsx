import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { WorkSchedule, AttendanceRecord } from '../types';

interface PayrollContextType {
  workSchedules: WorkSchedule[];
  addWorkSchedule: (schedule: WorkSchedule) => Promise<void>;
  updateWorkSchedule: (schedule: WorkSchedule) => Promise<void>;
  deleteWorkSchedule: (id: string) => Promise<void>;

  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (record: AttendanceRecord) => Promise<void>;
  updateAttendanceRecord: (record: AttendanceRecord) => Promise<void>;
  deleteAttendanceRecord: (id: string) => Promise<void>;
  saveAttendanceGrid: (records: AttendanceRecord[]) => Promise<void>;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  return context;
};

export const PayrollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch WorkSchedules
      const { data: schedulesData, error: schedulesError } = await supabase.from('work_schedules').select('*');
      if (schedulesError) {
        console.warn('Erro ao carregar work_schedules (Pode não existir a tabela ainda). Usando vazio.', schedulesError);
      } else {
        setWorkSchedules(schedulesData || []);
      }

      // 2. Fetch AttendanceRecords
      const { data: attendanceData, error: attendanceError } = await supabase.from('attendance_records').select('*');
      if (attendanceError) {
        console.warn('Erro ao carregar attendance_records (Pode não existir a tabela ainda). Usando vazio.', attendanceError);
      } else {
        setAttendanceRecords(attendanceData || []);
      }
    } catch (err) {
      console.error('Erro geral ao carregar dados da folha', err);
    }
  };

  const addWorkSchedule = async (schedule: WorkSchedule) => {
    try {
      const { data, error } = await supabase.from('work_schedules').insert([schedule]).select().single();
      if (error) throw error;
      if (data) setWorkSchedules(prev => [...prev, data]);
    } catch (err) {
      console.error('Erro ao adicionar escala, salvando localmente', err);
      setWorkSchedules(prev => [...prev, schedule]);
    }
  };

  const updateWorkSchedule = async (schedule: WorkSchedule) => {
    try {
      const { error } = await supabase.from('work_schedules').update(schedule).eq('id', schedule.id);
      if (error) throw error;
      setWorkSchedules(prev => prev.map(s => s.id === schedule.id ? schedule : s));
    } catch (err) {
      console.error('Erro ao atualizar escala, salvando localmente', err);
      setWorkSchedules(prev => prev.map(s => s.id === schedule.id ? schedule : s));
    }
  };

  const deleteWorkSchedule = async (id: string) => {
    try {
      const { error } = await supabase.from('work_schedules').delete().eq('id', id);
      if (error) throw error;
      setWorkSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Erro ao deletar escala, deletando localmente', err);
      setWorkSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  const addAttendanceRecord = async (record: AttendanceRecord) => {
    try {
      const { data, error } = await supabase.from('attendance_records').insert([record]).select().single();
      if (error) throw error;
      if (data) setAttendanceRecords(prev => [...prev, data]);
    } catch (err) {
      setAttendanceRecords(prev => [...prev, record]);
    }
  };

  const updateAttendanceRecord = async (record: AttendanceRecord) => {
    try {
      const { error } = await supabase.from('attendance_records').update(record).eq('id', record.id);
      if (error) throw error;
      setAttendanceRecords(prev => prev.map(r => r.id === record.id ? record : r));
    } catch (err) {
      setAttendanceRecords(prev => prev.map(r => r.id === record.id ? record : r));
    }
  };

  const deleteAttendanceRecord = async (id: string) => {
    try {
      const { error } = await supabase.from('attendance_records').delete().eq('id', id);
      if (error) throw error;
      setAttendanceRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setAttendanceRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const saveAttendanceGrid = async (records: AttendanceRecord[]) => {
    // Para simplificar, num cenário real usaríamos um upsert.
    // Primeiro removemos os existentes no local, depois inserimos
    const recordsToSave = records.map(r => {
      // Remove temp ids if needed, but for local memory just keep them
      return { ...r, id: r.id.startsWith('temp-') ? crypto.randomUUID() : r.id };
    });

    try {
      const { error } = await supabase.from('attendance_records').upsert(recordsToSave, { onConflict: 'id' });
      if (error) throw error;
      
      setAttendanceRecords(prev => {
        const otherRecords = prev.filter(p => !recordsToSave.some(r => r.id === p.id && r.employee_id === p.employee_id && r.date === p.date));
        return [...otherRecords, ...recordsToSave];
      });
    } catch (err) {
      // Salva local
      setAttendanceRecords(prev => {
        // Remover antigos com mesma data/empregado (simula upsert lógico)
        const otherRecords = prev.filter(p => !recordsToSave.some(r => r.employee_id === p.employee_id && r.date === p.date));
        return [...otherRecords, ...recordsToSave];
      });
    }
  };

  return (
    <PayrollContext.Provider value={{
      workSchedules, addWorkSchedule, updateWorkSchedule, deleteWorkSchedule,
      attendanceRecords, addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord, saveAttendanceGrid
    }}>
      {children}
    </PayrollContext.Provider>
  );
};
