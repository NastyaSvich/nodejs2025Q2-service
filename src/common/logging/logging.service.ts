import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

@Injectable()
export class LoggingService {
  private readonly logLevel: LogLevel;
  private readonly logLevels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
  private readonly logFilePath: string;
  private readonly maxFileSizeKB: number;
  errorStream: any;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;
    this.logFilePath = path.join(process.cwd(), 'logs', 'app.log');
    this.maxFileSizeKB = parseInt(process.env.LOG_MAX_SIZE || '100');
    this.errorStream = fs.createWriteStream(path.resolve('logs/error.log'), {
      flags: 'a',
    });

    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return (
      this.logLevels.indexOf(level) <= this.logLevels.indexOf(this.logLevel)
    );
  }

  private rotateLogFileIfNeeded() {
    if (fs.existsSync(this.logFilePath)) {
      const stats = fs.statSync(this.logFilePath);
      const sizeKB = stats.size / 1024;
      if (sizeKB > this.maxFileSizeKB) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotated = this.logFilePath.replace(/\.log$/, `-${timestamp}.log`);
        fs.renameSync(this.logFilePath, rotated);
      }
    }
  }

  private write(message: string, logLevel: LogLevel) {
    this.rotateLogFileIfNeeded();
    const line = `${new Date().toISOString()} ${message}`;
    fs.appendFileSync(this.logFilePath, line + '\n');
    process.stdout.write(line + '\n');
    if (logLevel === 'error') {
      this.errorStream.write(line + '\n');
    }
  }

  log(message: string) {
    if (this.shouldLog('info')) this.write(`[INFO] ${message}`, 'info');
  }

  warn(message: string) {
    if (this.shouldLog('warn')) this.write(`[WARN] ${message}`, 'warn');
  }

  error(message: string) {
    if (this.shouldLog('error')) this.write(`[ERROR] ${message}`, 'error');
  }

  debug(message: string) {
    if (this.shouldLog('debug')) this.write(`[DEBUG] ${message}`, 'debug');
  }
}
