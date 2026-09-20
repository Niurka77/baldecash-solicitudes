import {
  CrearSolicitudInput,
  ListaSolicitudesResponse,
  RespuestaErrorApi,
  Solicitud,
  EstadoSolicitud,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Error tipado propio, para distinguir en la UI un fallo de validación (422,
// con detalle por campo) de un error genérico de red o servidor.
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errores?: RespuestaErrorApi['errores'],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function manejarRespuesta<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  const cuerpoError = (await response.json()) as RespuestaErrorApi;
  throw new ApiError(cuerpoError.message, response.status, cuerpoError.errores);
}

export async function crearSolicitud(input: CrearSolicitudInput): Promise<Solicitud> {
  const response = await fetch(`${API_URL}/solicitudes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  return manejarRespuesta<Solicitud>(response);
}

interface ListarSolicitudesParams {
  page: number;
  limit: number;
  estado?: EstadoSolicitud;
}

export async function listarSolicitudes(
  params: ListarSolicitudesParams,
): Promise<ListaSolicitudesResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.estado) {
    query.set('estado', params.estado);
  }

  const response = await fetch(`${API_URL}/solicitudes?${query.toString()}`, {
    cache: 'no-store',
  });

  return manejarRespuesta<ListaSolicitudesResponse>(response);
}

export async function actualizarEstadoSolicitud(
  id: string,
  estado: EstadoSolicitud,
): Promise<Solicitud> {
  const response = await fetch(`${API_URL}/solicitudes/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });

  return manejarRespuesta<Solicitud>(response);
}
