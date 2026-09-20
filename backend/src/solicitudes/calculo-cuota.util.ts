/**
 * Cálculo de cuota mensual bajo el sistema de amortización francés (cuota fija).
 *
 * cuota = P * ( i * (1 + i)^n ) / ( (1 + i)^n - 1 )
 *
 * Decisión técnica: esta función vive fuera del SolicitudesService, como una
 * función pura sin dependencias de NestJS ni de Prisma. Esto permite:
 *  - Probarla con Jest sin necesidad de levantar el módulo de Nest ni una DB.
 *  - Reutilizarla desde el script de seed sin duplicar la fórmula.
 *  - Aislar la lógica matemática del negocio (Single Responsibility Principle).
 */
export function calcularCuotaMensual(
  montoFinanciado: number,
  plazoMeses: number,
  tasaInteresAnual: number,
): number {
  const tasaInteresMensual = tasaInteresAnual / 12;

  const factorPotencia = Math.pow(1 + tasaInteresMensual, plazoMeses);
  const cuota =
    (montoFinanciado * (tasaInteresMensual * factorPotencia)) /
    (factorPotencia - 1);

  // Redondeo a 2 decimales, como exige el enunciado (soles con céntimos).
  return Math.round(cuota * 100) / 100;
}
