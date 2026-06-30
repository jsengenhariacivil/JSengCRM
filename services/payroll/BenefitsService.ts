export class BenefitsService {
  /**
   * Calcula o valor total da alimentação no período.
   * Só ganha alimentação pelos dias efetivamente TRABALHADOS.
   */
  static calculateFoodAllowance(dailyFoodValue: number, workedDays: number): number {
    return (dailyFoodValue || 0) * workedDays;
  }

  /**
   * Calcula o valor total do café no período.
   * Só ganha café pelos dias efetivamente TRABALHADOS.
   */
  static calculateCoffeeAllowance(dailyCoffeeValue: number, workedDays: number): number {
    return (dailyCoffeeValue || 0) * workedDays;
  }

  /**
   * Calcula o valor da cesta básica.
   * Regra: Caso exista pelo menos UMA falta (não justificada/atestado), perde 100% da cesta.
   */
  static calculateBasicBasket(basketValue: number, absences: number): number {
    if (absences > 0) {
      return 0; // Desconto integral
    }
    return basketValue || 0;
  }
}
