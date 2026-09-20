import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { validationExceptionFactory } from './common/config/validation.exception-factory';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // CORS habilitado para que el frontend Next.js (otro origen) pueda consumir la API.
  app.enableCors();

  // ValidationPipe global: convierte los errores de class-validator en
  // excepciones de validación, que luego el AllExceptionsFilter transforma
  // en la respuesta HTTP 422 estructurada que exige el enunciado.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // rechaza el request si llegan propiedades extra
      transform: true, // castea tipos primitivos automáticamente (ej. query params)
      errorHttpStatusCode: 422,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  // Filtro global: única puerta de salida para cualquier error de la app.
  // Así garantizamos que ningún endpoint futuro filtre trazas de un 500.
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  console.log(`Backend BaldeCash corriendo en http://localhost:${port}`);
}

bootstrap();
