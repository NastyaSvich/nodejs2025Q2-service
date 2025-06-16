import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggingService } from './logging.service';
import { parse as parseQuery } from 'querystring';
import { IncomingMessage } from 'http';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<Request>() as unknown as IncomingMessage;
    const response = httpCtx.getResponse();

    const method = request.method;
    const urlWithQuery = request.url;
    const queryString = urlWithQuery.split('?')[1] || '';
    const queryParams = parseQuery(queryString);
    const bodyChunks: Uint8Array[] = [];

    if ('on' in request) {
      request.on('data', (chunk) => bodyChunks.push(chunk));
    }

    return next.handle().pipe(
      tap(() => {
        const body = Buffer.concat(bodyChunks).toString() || 'EMPTY';
        this.logger.log(
          `Incoming Request: ${method} ${urlWithQuery} | Query: ${JSON.stringify(
            queryParams,
          )} | Body: ${body}`,
        );
        this.logger.log(
          `Response: ${method} ${urlWithQuery} | Status: ${response.statusCode}`,
        );
      }),
    );
  }
}
