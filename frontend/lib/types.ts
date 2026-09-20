export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export const PLAZOS_PERMITIDOS = [6, 12, 18, 24] as const;
export type PlazoMeses = (typeof PLAZOS_PERMITIDOS)[number];

export interface Solicitud {
  id: string;
  nombre: string;
  dni: string;
  telefono: string;
  correo: string;
  monto: number;
  plazoMeses: number;
  cuotaMensual: number;
  estado: EstadoSolicitud;
  createdAt: string;
}

export interface CrearSolicitudInput {
  nombre: string;
  dni: string;
  telefono: string;
  correo: string;
  monto: number;
  plazoMeses: PlazoMeses;
}

export interface ListaSolicitudesResponse {
  data: Solicitud[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorDeCampo {
  campo: string;
  mensaje: string;
}

// Forma exacta del cuerpo 422 que devuelve el AllExceptionsFilter del backend.
export interface RespuestaErrorApi {
  statusCode: number;
  message: string;
  errores?: ErrorDeCampo[];
}
