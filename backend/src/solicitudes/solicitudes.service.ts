import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { QuerySolicitudesDto } from './dto/query-solicitudes.dto';
import { calcularCuotaMensual } from './calculo-cuota.util';
import { EstadoSolicitud } from './estado-solicitud.enum';
import {
  ListaSolicitudesResponse,
  SolicitudResponse,
} from './solicitudes.types';

// Valor por defecto seguro si TASA_INTERES_ANUAL no está definida en .env.
const TASA_INTERES_ANUAL_DEFAULT = 0.24;

@Injectable()
export class SolicitudesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async crear(dto: CreateSolicitudDto): Promise<SolicitudResponse> {
    const tasaInteresAnual = this.obtenerTasaInteresAnual();

    const cuotaMensual = calcularCuotaMensual(
      dto.monto,
      dto.plazoMeses,
      tasaInteresAnual,
    );

    const solicitudCreada = await this.prisma.solicitud.create({
      data: {
        nombre: dto.nombre,
        dni: dto.dni,
        telefono: dto.telefono,
        correo: dto.correo,
        monto: dto.monto,
        plazoMeses: dto.plazoMeses,
        cuotaMensual,
      },
    });

    return this.mapearASolicitudResponse(solicitudCreada);
  }

  async listar(query: QuerySolicitudesDto): Promise<ListaSolicitudesResponse> {
    const { page, limit, estado } = query;

    const filtro: Prisma.SolicitudWhereInput = estado ? { estado } : {};

    const [solicitudes, total] = await this.prisma.$transaction([
      this.prisma.solicitud.findMany({
        where: filtro,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.solicitud.count({ where: filtro }),
    ]);

    return {
      data: solicitudes.map((solicitud) => this.mapearASolicitudResponse(solicitud)),
      total,
      page,
      limit,
    };
  }

  async actualizarEstado(
    id: string,
    estado: EstadoSolicitud,
  ): Promise<SolicitudResponse> {
    const solicitudExistente = await this.prisma.solicitud.findUnique({
      where: { id },
    });

    if (!solicitudExistente) {
      throw new NotFoundException(`No existe una solicitud con id ${id}`);
    }

    const solicitudActualizada = await this.prisma.solicitud.update({
      where: { id },
      data: { estado },
    });

    return this.mapearASolicitudResponse(solicitudActualizada);
  }

  private obtenerTasaInteresAnual(): number {
    return this.configService.get<number>(
      'TASA_INTERES_ANUAL',
      TASA_INTERES_ANUAL_DEFAULT,
    );
  }

  // En SQLite, `monto` y `cuotaMensual` se guardan como Float (número simple),
  // así que Prisma ya las devuelve como `number`; no hace falta convertir
  // desde un tipo Decimal como ocurriría con el provider de PostgreSQL.
  private mapearASolicitudResponse(solicitud: {
    id: string;
    nombre: string;
    dni: string;
    telefono: string;
    correo: string;
    monto: number;
    plazoMeses: number;
    cuotaMensual: number;
    estado: string;
    createdAt: Date;
  }): SolicitudResponse {
    return {
      id: solicitud.id,
      nombre: solicitud.nombre,
      dni: solicitud.dni,
      telefono: solicitud.telefono,
      correo: solicitud.correo,
      monto: solicitud.monto,
      plazoMeses: solicitud.plazoMeses,
      cuotaMensual: solicitud.cuotaMensual,
      estado: solicitud.estado as EstadoSolicitud,
      createdAt: solicitud.createdAt,
    };
  }
}
