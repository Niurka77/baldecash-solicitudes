import { calcularCuotaMensual } from './calculo-cuota.util';

describe('calcularCuotaMensual', () => {
  const TASA_INTERES_ANUAL = 0.24; // 24% anual -> 2% mensual

  it('calcula S/ 283.68 para P=3000 y n=12 (caso de validación del enunciado)', () => {
    const cuota = calcularCuotaMensual(3000, 12, TASA_INTERES_ANUAL);
    expect(cuota).toBe(283.68);
  });

  it('redondea el resultado a 2 decimales', () => {
    const cuota = calcularCuotaMensual(2500, 18, TASA_INTERES_ANUAL);
    expect(Number.isInteger(cuota * 100)).toBe(true);
  });

  it('devuelve una cuota mayor cuanto menor es el plazo, para un mismo monto', () => {
    const cuota6meses = calcularCuotaMensual(5000, 6, TASA_INTERES_ANUAL);
    const cuota24meses = calcularCuotaMensual(5000, 24, TASA_INTERES_ANUAL);
    expect(cuota6meses).toBeGreaterThan(cuota24meses);
  });

  it('respeta el límite superior del monto permitido (S/ 10,000)', () => {
    const cuota = calcularCuotaMensual(10000, 24, TASA_INTERES_ANUAL);
    expect(cuota).toBeGreaterThan(0);
  });

  it('usa la tasa anual recibida como parámetro, no un valor fijo interno', () => {
    const cuotaCon24 = calcularCuotaMensual(3000, 12, 0.24);
    const cuotaCon28 = calcularCuotaMensual(3000, 12, 0.28);
    expect(cuotaCon28).toBeGreaterThan(cuotaCon24);
  });
});
