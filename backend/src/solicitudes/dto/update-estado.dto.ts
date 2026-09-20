import { IsIn } from 'class-validator';
import { EstadoSolicitud, ESTADOS_SOLICITUD } from '../estado-solicitud.enum';

export class UpdateEstadoDto {
  @IsIn(ESTADOS_SOLICITUD, {
    message: `estado debe ser uno de: ${ESTADOS_SOLICITUD.join(', ')}`,
  })
  estado!: EstadoSolicitud;
}
