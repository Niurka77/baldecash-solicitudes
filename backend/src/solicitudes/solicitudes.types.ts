import { EstadoSolicitud } from './estado-solicitud.enum';

export interface SolicitudResponse {
  id: string;
  nombre: string;
  dni: string;
  telefono: string;
  correo: string;
  monto: number;
  plazoMeses: number;
  cuotaMensual: number;
  estado: EstadoSolicitud;
  createdAt: Date;
}

export interface ListaSolicitudesResponse {
  data: SolicitudResponse[];
  total: number;
  page: number;
  limit: number;
}
