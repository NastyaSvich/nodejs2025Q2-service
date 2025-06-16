import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingService {
  private readonly level: LogLevel;
  private readonly errorStream: fs.WriteStream;
  private readonly logLevels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
  private readonly filePath: string;
  private readonly maxFileSizeKB: number;

  constructor() {
    this.level = (process.env.LOG_LEVEL || 'info') as LogLevel;
    this.filePath = path.join(process.cwd(), 'logs', 'app.log');
    this.maxFileSizeKB = parseInt(process.env.LOG_MAX_SIZE || '100');
    this.errorStream = fs.createWriteStream(path.resolve('logs/error.log'), {
      flags: 'a',
    });

    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels.indexOf(level) <= this.logLevels.indexOf(this.level);
  }

  private rotateLogFileIfNeeded() {
    if (fs.existsSync(this.filePath)) {
      const stats = fs.statSync(this.filePath);
      const sizeKB = stats.size / 1024;

      if (sizeKB > this.maxFileSizeKB) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotated = this.filePath.replace(/\.log$/, `-${timestamp}.log`);
        fs.renameSync(this.filePath, rotated);
      }
    }
  }

  private write(message: string, logLevel: LogLevel) {
    this.rotateLogFileIfNeeded();
    const line = `${new Date().toISOString()} ${message}`;
    fs.appendFileSync(this.filePath, line + '\n');
    process.stdout.write(line + '\n');
    if (logLevel === 'error') {
      this.errorStream.write(line + '\n');
    }
  }

  error(message: string) {
    if (this.shouldLog('error')) this.write(`[ERROR] ${message}`, 'error');
  }

  warn(message: string) {
    if (this.shouldLog('warn')) this.write(`[WARN] ${message}`, 'warn');
  }

  log(message: string) {
    if (this.shouldLog('info')) this.write(`[INFO] ${message}`, 'info');
  }

  debug(message: string) {
    if (this.shouldLog('debug')) this.write(`[DEBUG] ${message}`, 'debug');
  }
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
