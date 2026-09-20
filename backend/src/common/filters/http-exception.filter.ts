import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface RespuestaError {
  statusCode: number;
  path: string;
  timestamp: string;
  message: string;
  errores?: Array<{ campo: string; mensaje: string }>;
}

/**
 * Filtro global de excepciones.
 *
 * Decisión técnica: es la única puerta de salida de errores de toda la app.
 * - Si el error es una HttpException conocida (ej. la que arma el ValidationPipe
 *   para un 422, o un NotFoundException lanzado desde el service), se respeta
 *   su status y su cuerpo estructurado.
 * - Si el error NO es una HttpException (una excepción no controlada: fallo de
 *   conexión a la DB, un bug, etc.), se responde siempre 500 con un mensaje
 *   genérico. La traza real se registra con Logger del lado del servidor,
 *   nunca se envía al cliente.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const respuestaOriginal = exception.getResponse();

      const cuerpo: RespuestaError = this.normalizarRespuestaHttp(
        respuestaOriginal,
        status,
        request.url,
      );

      response.status(status).json(cuerpo);
      return;
    }

    // Error no controlado: se loguea completo en el servidor, pero al
    // cliente solo le llega un mensaje genérico sin detalles internos.
    this.logger.error(
      'Error no controlado',
      exception instanceof Error ? exception.stack : String(exception),
    );

    const cuerpo: RespuestaError = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      path: request.url,
      timestamp: new Date().toISOString(),
      message: 'Ocurrió un error interno. Intenta nuevamente más tarde.',
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(cuerpo);
  }

  private normalizarRespuestaHttp(
    respuestaOriginal: string | object,
    status: number,
    path: string,
  ): RespuestaError {
    const base = {
      statusCode: status,
      path,
      timestamp: new Date().toISOString(),
    };

    if (typeof respuestaOriginal === 'string') {
      return { ...base, message: respuestaOriginal };
    }

    // El exceptionFactory del ValidationPipe (ver validation.exception-factory.ts)
    // ya entrega { message, errores } con el detalle por campo; lo propagamos tal cual.
    const cuerpo = respuestaOriginal as { message?: string; errores?: RespuestaError['errores'] };

    return {
      ...base,
      message: cuerpo.message ?? 'Error en la solicitud',
      ...(cuerpo.errores ? { errores: cuerpo.errores } : {}),
    };
  }
}
