import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ErrorLoggerService {
  private readonly logger = new Logger(ErrorLoggerService.name);

  /**
   * Logs error context, message, stack and optional Prisma code for debugging.
   */
  logError(context: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const prismaCode =
      error && typeof error === 'object' && 'code' in error
        ? (error as { code: string }).code
        : undefined;

    this.logger.error(`[${context}] ${message}`, stack);
    if (prismaCode) {
      this.logger.error(`[${context}] Prisma code: ${prismaCode}`);
    }
  }
}
