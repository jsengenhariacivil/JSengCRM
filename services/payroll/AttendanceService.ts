import { AttendanceRecord, WorkSchedule, AttendanceStatus } from '../../types';
import { CalendarService } from './CalendarService';
import { WorkScheduleService } from './WorkScheduleService';

export class AttendanceService {
  /**
   * Gera o espelho de ponto padrão (vazio/inicial) para um período, baseado na escala.
   * Se for dia de trabalho na escala, o status padrão pode ser "Presente".
   * Se for dia de folga na escala, o status padrão será "Folga".
   * Registros existentes sobressaem a esse padrão.
   */
  static generateAttendanceGrid(
    employeeId: string,
    startDate: string,
    endDate: string,
    schedule: WorkSchedule,
    existingRecords: AttendanceRecord[] = []
  ): AttendanceRecord[] {
    const dates = CalendarService.getDatesInRange(startDate, endDate);
    const grid: AttendanceRecord[] = [];

    const recordsMap = new Map(existingRecords.map(r => [r.date, r]));

    for (const date of dates) {
      if (recordsMap.has(date)) {
        grid.push(recordsMap.get(date)!);
      } else {
        const isWorkDay = WorkScheduleService.isWorkDay(date, schedule);
        grid.push({
          id: `temp-${date}`, // temporary ID
          employee_id: employeeId,
          date: date,
          status: isWorkDay ? 'Presente' : 'Folga'
        });
      }
    }

    return grid;
  }

  static countAbsences(grid: AttendanceRecord[], schedule: WorkSchedule): number {
    return grid.filter(r => r.status === 'Falta' && WorkScheduleService.isWorkDay(r.date, schedule)).length;
  }

  static countJustifiedAbsences(grid: AttendanceRecord[], schedule: WorkSchedule): number {
    return grid.filter(r => r.status === 'Falta Justificada' && WorkScheduleService.isWorkDay(r.date, schedule)).length;
  }

  static countMedicalCertificates(grid: AttendanceRecord[], schedule: WorkSchedule): number {
    return grid.filter(r => r.status === 'Atestado' && WorkScheduleService.isWorkDay(r.date, schedule)).length;
  }

  static countActualWorkedDays(grid: AttendanceRecord[], schedule: WorkSchedule): number {
    // Para simplificar, consideramos "Trabalhado" os dias previstos na escala que estão marcados como 'Presente'
    // Além disso, se a pessoa for trabalhar na 'Folga', deveria marcar como 'Compensação' ou algo,
    // mas inicialmente a regra financeira foca apenas em Presente/Falta.
    return grid.filter(r => r.status === 'Presente' && WorkScheduleService.isWorkDay(r.date, schedule)).length;
  }
}
