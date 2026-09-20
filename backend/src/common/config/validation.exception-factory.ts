import { UnprocessableEntityException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

interface ErrorDeCampo {
  campo: string;
  mensaje: string;
}

/**
 * Aplana los ValidationError anidados de class-validator en una lista simple
 * de { campo, mensaje }, y arma la excepción 422 con el formato que exige el
 * enunciado: "indicar claramente qué campo falló y por qué".
 */
export function validationExceptionFactory(
  errores: ValidationError[],
): UnprocessableEntityException {
  const erroresPorCampo: ErrorDeCampo[] = errores.flatMap((error) =>
    aplanarError(error),
  );

  return new UnprocessableEntityException({
    message: 'Error de validación en los datos enviados',
    errores: erroresPorCampo,
  });
}

function aplanarError(error: ValidationError, prefijo = ''): ErrorDeCampo[] {
  const campo = prefijo ? `${prefijo}.${error.property}` : error.property;

  const mensajesPropios: ErrorDeCampo[] = error.constraints
    ? Object.values(error.constraints).map((mensaje) => ({ campo, mensaje }))
    : [];

  const mensajesHijos: ErrorDeCampo[] = error.children?.length
    ? error.children.flatMap((hijo) => aplanarError(hijo, campo))
    : [];

  return [...mensajesPropios, ...mensajesHijos];
}
