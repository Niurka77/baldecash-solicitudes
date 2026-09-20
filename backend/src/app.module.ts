import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SolicitudesModule } from './solicitudes/solicitudes.module';

@Module({
  imports: [
    // ConfigModule global: permite inyectar ConfigService en cualquier
    // provider (ej. SolicitudesService) en vez de leer process.env directamente
    // desde la lógica de negocio, lo que facilita mockear la config en tests.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SolicitudesModule,
  ],
})
export class AppModule {}
