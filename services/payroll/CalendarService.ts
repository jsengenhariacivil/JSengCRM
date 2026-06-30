export class CalendarService {
  // Simulação de feriados nacionais (Brasil)
  // Em produção, isso poderia vir de uma API (ex: Nager.Date ou similar) ou do banco.
  private static holidays = [
    '2026-01-01', // Confraternização Universal
    '2026-02-16', // Carnaval
    '2026-02-17', // Carnaval
    '2026-04-03', // Paixão de Cristo
    '2026-04-21', // Tiradentes
    '2026-05-01', // Dia do Trabalho
    '2026-06-04', // Corpus Christi
    '2026-09-07', // Independência
    '2026-10-12', // Nossa Senhora Aparecida
    '2026-11-02', // Finados
    '2026-11-15', // Proclamação da República
    '2026-12-25', // Natal
  ];

  static isHoliday(dateStr: string): boolean {
    return this.holidays.includes(dateStr);
  }

  static getDatesInRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  static getDayOfWeek(dateStr: string): 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' {
    const d = new Date(`${dateStr}T00:00:00`);
    const day = d.getDay();
    switch (day) {
      case 0: return 'sunday';
      case 1: return 'monday';
      case 2: return 'tuesday';
      case 3: return 'wednesday';
      case 4: return 'thursday';
      case 5: return 'friday';
      case 6: return 'saturday';
      default: return 'monday'; // fallback safety
    }
  }

  static countSaturdays(dates: string[]): number {
    return dates.filter(d => this.getDayOfWeek(d) === 'saturday').length;
  }

  static countSundays(dates: string[]): number {
    return dates.filter(d => this.getDayOfWeek(d) === 'sunday').length;
  }

  static countHolidays(dates: string[]): number {
    return dates.filter(d => this.isHoliday(d)).length;
  }

  static splitDatesByDay(dates: string[], splitDay: number): { p1Dates: string[], p2Dates: string[] } {
    if (dates.length === 0) return { p1Dates: [], p2Dates: [] };
    
    const splitIndex = dates.findIndex(d => parseInt(d.split('-')[2], 10) === splitDay);
    
    if (splitIndex === -1) {
      return { p1Dates: dates, p2Dates: [] };
    }

    const p1Dates = dates.slice(0, splitIndex + 1);
    const p2Dates = dates.slice(splitIndex + 1);
    
    return { p1Dates, p2Dates };
  }
}
