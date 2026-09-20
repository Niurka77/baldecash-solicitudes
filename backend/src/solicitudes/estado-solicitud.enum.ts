// SQLite no soporta enums nativos en el motor de Prisma, así que el estado
// se guarda como columna de texto y se valida en esta única fuente de verdad
// compartida por los DTOs, el service y el frontend (vía solicitudes.types.ts).
export const ESTADOS_SOLICITUD = ['pendiente', 'aprobada', 'rechazada'] as const;
export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];
