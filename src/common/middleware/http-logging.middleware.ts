import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import {
  sanitizeForLog,
  stringifyForLog,
} from '../utils/sanitize-log.util';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly config: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = randomUUID().slice(0, 8);
    const startedAt = Date.now();
    const { method, originalUrl, ip } = req;
    const logBodies = this.shouldLogBodies();
    const maxBodyLength = this.getMaxBodyLength();

    (req as Request & { requestId?: string }).requestId = requestId;

    const requestParts: string[] = [
      `--> [${requestId}] ${method} ${originalUrl}`,
      `ip=${ip}`,
    ];

    if (Object.keys(req.query).length) {
      requestParts.push(
        `query=${stringifyForLog(sanitizeForLog(req.query), maxBodyLength)}`,
      );
    }
    if (Object.keys(req.params ?? {}).length) {
      requestParts.push(
        `params=${stringifyForLog(sanitizeForLog(req.params), maxBodyLength)}`,
      );
    }
    if (logBodies && req.body && Object.keys(req.body).length) {
      requestParts.push(
        `body=${stringifyForLog(sanitizeForLog(req.body), maxBodyLength)}`,
      );
    }

    this.logger.log(requestParts.join(' | '));

    const chunks: Buffer[] = [];
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.json = (body: unknown) => {
      if (logBodies) {
        this.captureChunk(
          chunks,
          Buffer.from(stringifyForLog(sanitizeForLog(body), maxBodyLength)),
        );
      }
      return originalJson(body);
    };

    res.send = (body?: unknown) => {
      if (logBodies && body !== undefined) {
        this.captureChunk(chunks, this.toBuffer(body));
      }
      return originalSend(body);
    };

    res.write = ((chunk: unknown, ...args: unknown[]) => {
      if (logBodies && chunk) {
        this.captureChunk(chunks, this.toBuffer(chunk));
      }
      return originalWrite(chunk as never, ...(args as never[]));
    }) as typeof res.write;

    res.end = ((chunk?: unknown, ...args: unknown[]) => {
      if (logBodies && chunk) {
        this.captureChunk(chunks, this.toBuffer(chunk));
      }
      return originalEnd(chunk as never, ...(args as never[]));
    }) as typeof res.end;

    res.on('finish', () =>
      this.logResponse(
        requestId,
        method,
        originalUrl,
        res.statusCode,
        Date.now() - startedAt,
        chunks,
        logBodies,
        maxBodyLength,
      ),
    );

    next();
  }

  private logResponse(
    requestId: string,
    method: string,
    url: string,
    statusCode: number,
    durationMs: number,
    chunks: Buffer[],
    logBodies: boolean,
    maxBodyLength: number,
  ): void {
    const parts: string[] = [
      `<-- [${requestId}] ${method} ${url}`,
      `status=${statusCode}`,
      `duration=${durationMs}ms`,
    ];

    if (logBodies && chunks.length) {
      const body = Buffer.concat(chunks).toString('utf8');
      parts.push(`response=${truncateResponseBody(body, maxBodyLength)}`);
    }

    const line = parts.join(' | ');
    if (statusCode >= 500) {
      this.logger.error(line);
    } else if (statusCode >= 400) {
      this.logger.warn(line);
    } else {
      this.logger.log(line);
    }
  }

  private captureChunk(chunks: Buffer[], chunk: Buffer): void {
    if (chunk.length) {
      chunks.push(chunk);
    }
  }

  private toBuffer(data: unknown): Buffer {
    if (Buffer.isBuffer(data)) {
      return data;
    }
    if (typeof data === 'string') {
      return Buffer.from(data);
    }
    return Buffer.from(stringifyForLog(sanitizeForLog(data), 4096));
  }

  private shouldLogBodies(): boolean {
    return (
      this.config.get<string>('HTTP_LOG_BODIES', 'true').toLowerCase() ===
      'true'
    );
  }

  private getMaxBodyLength(): number {
    return Number(this.config.get<string>('HTTP_LOG_MAX_BODY_LENGTH', '4096'));
  }
}

function truncateResponseBody(body: string, maxLength: number): string {
  const trimmed = body.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength)}… [tronqué]`;
}
