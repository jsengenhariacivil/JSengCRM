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
    
    // Contagens de calendário
    const saturdays = CalendarService.countSaturdays(dates);
    const sundays = CalendarService.countSundays(dates);
    const holidays = CalendarService.countHolidays(dates);

    // Contagens de escala
    const expectedDays = WorkScheduleService.getExpectedWorkDaysCount(startDate, endDate, schedule);
    
    // Contagens de frequência
    const absences = AttendanceService.countAbsences(attendanceGrid, schedule);
    const justifiedAbsences = AttendanceService.countJustifiedAbsences(attendanceGrid, schedule);
    const medicalCertificates = AttendanceService.countMedicalCertificates(attendanceGrid, schedule);
    // Dias trabalhados na prática = esperados - faltas - justificadas - atestados (assumindo que justificadas abonam a falta, mas não são trabalhados)
    // Para a folha: dias para calcular benefícios
    // Vamos usar a contagem direta de 'Presente' em dia de trabalho
    const workedDays = AttendanceService.countActualWorkedDays(attendanceGrid, schedule);

    // Valores Base do Funcionário
    const baseSalary = employee.base_salary || 0;
    const bonus = employee.bonus || 0;
    const dailyFoodValue = employee.lunch_allowance || 0;
    const dailyCoffeeValue = employee.breakfast_allowance || 0;
    const basketValue = employee.cesta_basica || 0;

    // Proventos / Benefícios
    const foodAllowance = BenefitsService.calculateFoodAllowance(dailyFoodValue, workedDays);
    const coffeeAllowance = BenefitsService.calculateCoffeeAllowance(dailyCoffeeValue, workedDays);
    const basicBasket = BenefitsService.calculateBasicBasket(basketValue, absences);

    const grossRemuneration = baseSalary + bonus + foodAllowance + coffeeAllowance + basicBasket;

    // Valor Diário = Remuneração Bruta / Dias Previstos para Trabalho (conforme regra #6: Remuneração Bruta ÷ Dias trabalhados [previstos na escala para o período])
    // Se expectedDays for 0 (ex: tirou folga o período todo), dailyRate é 0 para evitar Infinity.
    // Pela regra #6: "Valor Diário = Remuneração Bruta ÷ Dias trabalhados. Nunca utilizar 30 ou 31 dias. Sempre utilizar a quantidade real de dias trabalhados naquele período conforme a escala."
    // Entende-se "dias trabalhados conforme a escala" como os dias previstos.
    const dailyRate = expectedDays > 0 ? grossRemuneration / expectedDays : 0;

    // Descontos
    const discountAbsences = dailyRate * absences;
    const discountFood = dailyFoodValue * absences;
    const discountCoffee = dailyCoffeeValue * absences;
    
    // A cesta é perdida integralmente se tiver falta, mas o valor da cesta já não entrou no Bruto?
    // "Caso exista pelo menos uma falta: Descontar integralmente a cesta básica."
    // Se ela entra no Bruto quando não tem falta e nós somamos, então o Desconto da Cesta é 0.
    // Mas a regra #5 diz: Remuneração Bruta = Salário + Bonificação + Alimentação Total + Café Total + Cesta Básica
    // E a regra #9 diz: Valor Líquido = Remuneração Bruta - Desconto Diárias - Desconto Alimentação - Desconto Café - Desconto Cesta.
    // Se somarmos a cesta fixa no bruto, o "Desconto Cesta" será igual ao valor da cesta caso haja falta.
    // Vamos ajustar: o Bruto sempre soma a cesta cheia, e o desconto retira se tiver falta.
    const grossRemunerationForCalculation = baseSalary + bonus + foodAllowance + coffeeAllowance + basketValue;
    const newDailyRate = expectedDays > 0 ? grossRemunerationForCalculation / expectedDays : 0;
    
    const discountBasket = absences > 0 ? basketValue : 0;
    const newDiscountAbsences = newDailyRate * absences;
    const newDiscountFood = dailyFoodValue * absences; // Pode ter redundância se o foodAllowance for (workedDays * daily).
    // Espera, a regra #8 "Descontar alimentação: Valor diário * Quantidade de faltas"
    // Se já calculamos foodAllowance = daily * workedDays, então o desconto seria duplicado se calcularmos o Bruto com (daily * workedDays) e depois descontarmos.
    // Regra #5: Alimentação Total = Valor diário * Dias trabalhados.
    // Vamos seguir estritamente o texto:
    // Alimentação Total (bruto) = daily * expectedDays (para poder descontar depois) ou daily * workedDays?
    // "Alimentação Total = Valor diário da alimentação × Dias trabalhados"
    // Se Bruto = Salário + Bonificação + (Valor * Trabalhados)
    // E o Desconto = Valor * Faltas
    // O valor líquido abateria a falta DUAS VEZES!
    // A melhor interpretação para o ERP:
    // Alimentação Base = Valor diário * Dias Previstos (Expected)
    // Bruto = Salário + Bonus + Alimentação Base + Café Base + Cesta Base
    // Descontos = Faltas * (DailyRate + ValorDiárioAlim + ValorDiárioCafe) + DescontoCesta
    
    const baseFood = dailyFoodValue * expectedDays;
    const baseCoffee = dailyCoffeeValue * expectedDays;
    const gross = baseSalary + bonus + baseFood + baseCoffee + basketValue;
    
    const rate = expectedDays > 0 ? gross / expectedDays : 0;
    
    const dAbsences = rate * absences;
    const dFood = dailyFoodValue * absences;
    const dCoffee = dailyCoffeeValue * absences;
    const dBasket = absences > 0 ? basketValue : 0;

    const totalDiscounts = dAbsences + dFood + dCoffee + dBasket;
    const netValue = gross - totalDiscounts;

    const items: PayrollItem[] = [
      { description: 'Salário Base', type: 'Provento', amount: baseSalary },
      { description: 'Bonificação', type: 'Provento', amount: bonus },
      { description: 'Auxílio Alimentação', type: 'Provento', amount: baseFood },
      { description: 'Auxílio Café', type: 'Provento', amount: baseCoffee },
      { description: 'Cesta Básica', type: 'Provento', amount: basketValue }
    ];

    if (dAbsences > 0) items.push({ description: 'Desconto de Faltas (Dias)', type: 'Desconto', amount: dAbsences });
    if (dFood > 0) items.push({ description: 'Desconto Alimentação (Faltas)', type: 'Desconto', amount: dFood });
    if (dCoffee > 0) items.push({ description: 'Desconto Café (Faltas)', type: 'Desconto', amount: dCoffee });
    if (dBasket > 0) items.push({ description: 'Desconto Cesta Básica (Faltas)', type: 'Desconto', amount: dBasket });

    return {
      employee_id: employee.id,
      employee_name: employee.name,
      role: employee.role,
      period_start: startDate,
      period_end: endDate,
      schedule_name: schedule.name,

      expected_days: expectedDays,
      worked_days: workedDays,
      absences: absences,
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
      gross_remuneration: gross,
      daily_rate: rate,

      discount_absences: dAbsences,
      discount_food: dFood,
      discount_coffee: dCoffee,
      discount_basket: dBasket,
      total_discounts: totalDiscounts,

      net_value: netValue,
      items: items
    };
  }
}
