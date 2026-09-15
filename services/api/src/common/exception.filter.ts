import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

function errorsObject(errors?: ValidationError[]): Record<string, string[]> | undefined {
  if (!errors) return undefined;
  const out: Record<string, string[]> = {};
  for (const e of errors) {
    if (!e.constraints) continue;
    out[e.property] = Object.values(e.constraints);
  }
  return Object.keys(out).length ? out : undefined;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else {
        const obj = body as { message?: string | string[]; error?: string; errors?: ValidationError[] };
        if (Array.isArray(obj.message)) {
          message = obj.message.join(', ');
        } else {
          message = obj.error || obj.message || exception.message;
        }
        errors = errorsObject(obj.errors);
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception instanceof Error ? exception.message : 'Internal server error';
      // eslint-disable-next-line no-console
      console.error(exception);
    }

    res.status(status).json({
      status,
      message,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path: req.originalUrl || req.url,
    });
  }
}