import { WorkSchedule } from '../../types';
import { CalendarService } from './CalendarService';

export class WorkScheduleService {
  /**
   * Verifica se uma data específica é um dia de trabalho previsto para a escala informada.
   */
  static isWorkDay(dateStr: string, schedule: WorkSchedule): boolean {
    const dayOfWeek = CalendarService.getDayOfWeek(dateStr);
    const isHoliday = CalendarService.isHoliday(dateStr);

    if (isHoliday && !schedule.consider_holidays_as_workdays) {
      return false;
    }

    switch (dayOfWeek) {
      case 'monday': return schedule.work_monday;
      case 'tuesday': return schedule.work_tuesday;
      case 'wednesday': return schedule.work_wednesday;
      case 'thursday': return schedule.work_thursday;
      case 'friday': return schedule.work_friday;
      case 'saturday': return schedule.work_saturday;
      case 'sunday': return schedule.work_sunday;
      default: return false;
    }
  }

  /**
   * Calcula quantos dias o funcionário deveria ter trabalhado naquele período, com base na escala.
   */
  static getExpectedWorkDaysCount(startDate: string, endDate: string, schedule: WorkSchedule): number {
    const dates = CalendarService.getDatesInRange(startDate, endDate);
    return this.getExpectedWorkDaysCountFromDates(dates, schedule);
  }

  static getExpectedWorkDaysCountFromDates(dates: string[], schedule: WorkSchedule): number {
    return dates.filter(date => this.isWorkDay(date, schedule)).length;
  }
}
