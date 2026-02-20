import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? (exception.getResponse() as any) : null;
    const message = raw?.message ?? (exception instanceof Error ? exception.message : null) ?? 'Internal server error';
    const messageList = Array.isArray(message) ? message : [message];
    if (status >= 500) this.logger.error(exception);
    response.status(status).json({
      statusCode: status,
      message: messageList,
      error: raw?.error,
    });
  }
}
