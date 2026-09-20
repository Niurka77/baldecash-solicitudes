import { Module } from '@nestjs/common';
import { SolicitudesController } from './solicitudes.controller';
import { SolicitudesService } from './solicitudes.service';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
  controllers: [SolicitudesController],
  providers: [SolicitudesService, PrismaService],
})
export class SolicitudesModule {}
