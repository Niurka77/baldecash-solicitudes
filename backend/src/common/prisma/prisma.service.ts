import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Se envuelve PrismaClient en un provider de Nest (en vez de instanciarlo
// suelto en cada service) para poder inyectarlo con el sistema de DI,
// controlar su conexión/desconexión con el ciclo de vida del módulo,
// y poder mockearlo fácilmente en tests unitarios.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
