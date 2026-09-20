import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

// Los plazos permitidos son un conjunto cerrado de meses, no cualquier entero.
export const PLAZOS_PERMITIDOS = [6, 12, 18, 24] as const;
export type PlazoMeses = (typeof PLAZOS_PERMITIDOS)[number];

export class CreateSolicitudDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre!: string;

  @Matches(/^\d{8}$/, { message: 'El DNI debe tener exactamente 8 dígitos numéricos' })
  dni!: string;

  @Matches(/^9\d{8}$/, {
    message: 'El teléfono debe tener 9 dígitos y comenzar en 9',
  })
  telefono!: string;

  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  correo!: string;

  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(1000, { message: 'El monto mínimo permitido es S/ 1,000' })
  @Max(10000, { message: 'El monto máximo permitido es S/ 10,000' })
  monto!: number;

  @IsInt({ message: 'El plazo debe ser un número entero de meses' })
  @IsIn(PLAZOS_PERMITIDOS, {
    message: `El plazo debe ser uno de: ${PLAZOS_PERMITIDOS.join(', ')} meses`,
  })
  plazoMeses!: PlazoMeses;
}
