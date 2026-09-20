import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { QuerySolicitudesDto } from './dto/query-solicitudes.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { ListaSolicitudesResponse, SolicitudResponse } from './solicitudes.types';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  crear(@Body() dto: CreateSolicitudDto): Promise<SolicitudResponse> {
    return this.solicitudesService.crear(dto);
  }

  @Get()
  listar(@Query() query: QuerySolicitudesDto): Promise<ListaSolicitudesResponse> {
    return this.solicitudesService.listar(query);
  }

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id') id: string,
    @Body() dto: UpdateEstadoDto,
  ): Promise<SolicitudResponse> {
    return this.solicitudesService.actualizarEstado(id, dto.estado);
  }
}
