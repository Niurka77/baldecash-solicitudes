import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { EstadoSolicitud, ESTADOS_SOLICITUD } from '../estado-solicitud.enum';

export class QuerySolicitudesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero' })
  @Min(1, { message: 'page debe ser mayor o igual a 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número entero' })
  @Min(1, { message: 'limit debe ser mayor o igual a 1' })
  limit: number = 10;

  @IsOptional()
  @IsIn(ESTADOS_SOLICITUD, {
    message: `estado debe ser uno de: ${ESTADOS_SOLICITUD.join(', ')}`,
  })
  estado?: EstadoSolicitud;
}
