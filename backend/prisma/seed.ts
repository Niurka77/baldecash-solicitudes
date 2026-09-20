import { PrismaClient } from '@prisma/client';
import { calcularCuotaMensual } from '../src/solicitudes/calculo-cuota.util';
import { EstadoSolicitud } from '../src/solicitudes/estado-solicitud.enum';

const prisma = new PrismaClient();

// Misma fuente de verdad que usa el servicio en tiempo de ejecución:
// si no hay variable de entorno definida, se usa 0.24 (24%) como default seguro.
const TASA_INTERES_ANUAL = process.env.TASA_INTERES_ANUAL
  ? Number(process.env.TASA_INTERES_ANUAL)
  : 0.24;

interface SolicitudSeed {
  nombre: string;
  dni: string;
  telefono: string;
  correo: string;
  monto: number;
  plazoMeses: number;
  estado: EstadoSolicitud;
}

const solicitudesIniciales: SolicitudSeed[] = [
  {
    nombre: 'Ana Torres Quispe',
    dni: '71234567',
    telefono: '987654321',
    correo: 'ana.torres@example.com',
    monto: 3000,
    plazoMeses: 12,
    estado: 'pendiente',
  },
  {
    nombre: 'Luis Fernández Rojas',
    dni: '72345678',
    telefono: '912345678',
    correo: 'luis.fernandez@example.com',
    monto: 5500,
    plazoMeses: 24,
    estado: 'aprobada',
  },
  {
    nombre: 'Carla Mendoza Ríos',
    dni: '73456789',
    telefono: '998877665',
    correo: 'carla.mendoza@example.com',
    monto: 1800,
    plazoMeses: 6,
    estado: 'rechazada',
  },
];

async function main(): Promise<void> {
  console.log('Sembrando solicitudes de ejemplo...');

  for (const solicitud of solicitudesIniciales) {
    const cuotaMensual = calcularCuotaMensual(
      solicitud.monto,
      solicitud.plazoMeses,
      TASA_INTERES_ANUAL,
    );

    await prisma.solicitud.create({
      data: {
        nombre: solicitud.nombre,
        dni: solicitud.dni,
        telefono: solicitud.telefono,
        correo: solicitud.correo,
        monto: solicitud.monto,
        plazoMeses: solicitud.plazoMeses,
        cuotaMensual,
        estado: solicitud.estado,
      },
    });
  }

  console.log(`Se crearon ${solicitudesIniciales.length} solicitudes de ejemplo.`);
}

main()
  .catch((error) => {
    console.error('Error al sembrar la base de datos:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
