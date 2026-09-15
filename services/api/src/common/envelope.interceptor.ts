import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Wraps every JSON response: envelope.data always equals the controller's
// return value, so endpoints that return { success, data, message } (user/profile
// creates) nest it inside the envelope as the frontend types expect.
@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((value) => {
        if (res.writableEnded) return value; // binary/file already sent
        const v = value ?? undefined;
        const ts = new Date().toISOString();
        if (v === undefined) return { success: true, timestamp: ts };
        const message = typeof v === 'object' && v !== null && 'message' in v ? (v.message as string) : undefined;
        return { success: true, data: v, timestamp: ts, ...(message !== undefined ? { message } : {}) };
      })
    );
  }
}