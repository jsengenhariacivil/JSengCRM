import { TeamMember, WorkSchedule, AttendanceRecord, PayrollResult, PayrollItem } from '../../types';
import { CalendarService } from './CalendarService';
import { WorkScheduleService } from './WorkScheduleService';
import { BenefitsService } from './BenefitsService';
import { AttendanceService } from './AttendanceService';

export class PayrollCalculatorService {
  static calculate(
    employee: TeamMember,
    schedule: WorkSchedule,
    startDate: string,
    endDate: string,
    attendanceGrid: AttendanceRecord[]
  ): PayrollResult {
    const dates = CalendarService.getDatesInRange(startDate, endDate);
    
    // Contagens de calendário totais
    const saturdays = CalendarService.countSaturdays(dates);
    const sundays = CalendarService.countSundays(dates);
    const holidays = CalendarService.countHolidays(dates);

    // Divisão de períodos (P1: até dia 20, P2: dia 21 em diante)
    const { p1Dates, p2Dates } = CalendarService.splitDatesByDay(dates, 20);

    // Contagens de escala e frequência para P1
    const p1ExpectedDays = WorkScheduleService.getExpectedWorkDaysCountFromDates(p1Dates, schedule);
    const p1Grid = attendanceGrid.filter(a => p1Dates.includes(a.date));
    const p1Absences = AttendanceService.countAbsences(p1Grid, schedule);
    const p1WorkedDays = Math.max(0, p1ExpectedDays - p1Absences); // simplificado, assumindo que falta reduz dia trabalhado

    // Contagens de escala e frequência para P2
    const p2ExpectedDays = WorkScheduleService.getExpectedWorkDaysCountFromDates(p2Dates, schedule);
    const p2Grid = attendanceGrid.filter(a => p2Dates.includes(a.date));
    const p2Absences = AttendanceService.countAbsences(p2Grid, schedule);
    const p2WorkedDays = Math.max(0, p2ExpectedDays - p2Absences);

    // Totais
    const totalExpectedDays = p1ExpectedDays + p2ExpectedDays;
    const totalAbsences = p1Absences + p2Absences;
    const justifiedAbsences = AttendanceService.countJustifiedAbsences(attendanceGrid, schedule);
    const medicalCertificates = AttendanceService.countMedicalCertificates(attendanceGrid, schedule);
    const totalWorkedDays = p1WorkedDays + p2WorkedDays; // ou AttendanceService.countActualWorkedDays

    // Valores Base do Funcionário
    const baseSalary = employee.base_salary || 0;
    const bonus = employee.bonus || 0;
    const dailyFoodValue = employee.lunch_allowance || 0;
    const dailyCoffeeValue = employee.breakfast_allowance || 0;
    const basketValue = employee.cesta_basica || 0;

    // Regra da Cesta Básica: perde tudo se >= 1 falta
    const finalBasketValue = totalAbsences > 0 ? 0 : basketValue;

    // --- OPÇÃO A (Bruto Cheio -> Valor Diário Perfeito) ---
    // Calculamos o Bruto Inicial como se tivesse trabalhado todos os dias previstos
    const baseFood = dailyFoodValue * totalExpectedDays;
    const baseCoffee = dailyCoffeeValue * totalExpectedDays;
    
    // Remuneração Bruta Cheia (para achar o valor diário)
    // A cesta básica entra no valor diário? A regra #5 diz "Cesta (caso não tenha perdido)". 
    // Para manter a cesta como um benefício fixo que não é proporcionalizado (pois não sofre desconto proporcional), 
    // a matemática mais limpa é calcular a Diária SEM a cesta, e depois somar a Cesta no final.
    // Mas o usuário pediu "Valor Bruto = Salário + Prêmio + Almoço + Café + Cesta". 
    // Se a cesta estiver na diária, faltar 1 dia descontará "1/20" da cesta além da perda total, o que seria duplo desconto também.
    // Solução da Opção A: O Bruto para o cálculo da diária contém apenas salário e benefícios variáveis.
    const grossForDailyRate = baseSalary + bonus + baseFood + baseCoffee;
    const dailyRate = totalExpectedDays > 0 ? grossForDailyRate / totalExpectedDays : 0;

    // --- VALORES DOS PERÍODOS ---
    const adiantamento = dailyRate * p1WorkedDays;
    const fechamento = dailyRate * p2WorkedDays;

    // Remuneração Bruta Total (O que ele realmente ganha)
    // = Adiantamento + Fechamento + Cesta (se tiver)
    const actualGrossRemuneration = adiantamento + fechamento + finalBasketValue;

    // Para fins descritivos no holerite, vamos decompor o que foi pago:
    // Ele efetivamente recebe proporcionalmente aos dias trabalhados
    const actualFood = dailyFoodValue * totalWorkedDays;
    const actualCoffee = dailyCoffeeValue * totalWorkedDays;
    // O Salário Base Efetivo = (Base / TotalExpected) * TotalWorked
    // Isso garante que o desconto ocorra corretamente no salário base também.
    
    // Para encaixar na lógica visual anterior sem assustar o usuário, calculamos os "Descontos":
    // Desconto = Valor Esperado - Valor Efetivo
    const dAbsences = totalExpectedDays > 0 ? (baseSalary / totalExpectedDays) * totalAbsences : 0;
    const dFood = dailyFoodValue * totalAbsences;
    const dCoffee = dailyCoffeeValue * totalAbsences;
    const dBasket = totalAbsences > 0 ? basketValue : 0;

    const totalDiscounts = dAbsences + dFood + dCoffee + dBasket;

    const items: PayrollItem[] = [
      { description: 'Salário Base', type: 'Provento', amount: baseSalary },
      { description: 'Bonificação', type: 'Provento', amount: bonus },
      { description: 'Auxílio Alimentação', type: 'Provento', amount: baseFood },
      { description: 'Auxílio Café', type: 'Provento', amount: baseCoffee },
      { description: 'Cesta Básica', type: 'Provento', amount: basketValue }
    ];

    if (dAbsences > 0) items.push({ description: 'Desconto de Faltas (Salário Base)', type: 'Desconto', amount: dAbsences });
    if (dFood > 0) items.push({ description: 'Desconto Alimentação (Faltas)', type: 'Desconto', amount: dFood });
    if (dCoffee > 0) items.push({ description: 'Desconto Café (Faltas)', type: 'Desconto', amount: dCoffee });
    if (dBasket > 0) items.push({ description: 'Desconto Cesta Básica (Perda por Falta)', type: 'Desconto', amount: dBasket });

    return {
      employee_id: employee.id,
      employee_name: employee.name,
      role: employee.role,
      period_start: startDate,
      period_end: endDate,
      schedule_name: schedule.name,

      expected_days: totalExpectedDays,
      worked_days: totalWorkedDays,
      absences: totalAbsences,
      justified_absences: justifiedAbsences,
      medical_certificates: medicalCertificates,
      saturdays: saturdays,
      sundays: sundays,
      holidays: holidays,

      base_salary: baseSalary,
      bonus: bonus,
      food_allowance: baseFood,
      coffee_allowance: baseCoffee,
      basic_basket: basketValue,
      gross_remuneration: actualGrossRemuneration,
      daily_rate: dailyRate,

      p1_expected_days: p1ExpectedDays,
      p1_worked_days: p1WorkedDays,
      adiantamento_value: adiantamento,
      
      p2_expected_days: p2ExpectedDays,
      p2_worked_days: p2WorkedDays,
      fechamento_value: fechamento + finalBasketValue, // O fechamento carrega a cesta básica se não foi perdida

      discount_absences: dAbsences,
      discount_food: dFood,
      discount_coffee: dCoffee,
      discount_basket: dBasket,
      total_discounts: totalDiscounts,

      net_value: actualGrossRemuneration,
      items: items
    };
  }
}
