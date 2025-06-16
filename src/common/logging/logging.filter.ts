import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LoggingService } from './logging.service';
import { parse as parseUrl } from 'url';
import { parse as parseQuery } from 'querystring';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest<any>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal Server Error';

    const { query } = parseUrl(request.url);
    const queryParams = parseQuery(query || '');
    this.logger.error(
      `Exception during ${request.method} ${request.url} | Query: ${JSON.stringify(queryParams)} | Status: ${status} | Message: ${message}`,
    );

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
