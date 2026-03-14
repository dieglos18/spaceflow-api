import { Injectable, Logger } from '@nestjs/common';

const KNOWN_PRISMA_CLIENT_CODES = ['P2002', 'P2003', 'P2025'];

@Injectable()
export class ErrorLoggerService {
  private readonly logger = new Logger(ErrorLoggerService.name);

  /**
   * Logs error context and details. For known Prisma client errors (unique, FK, not found)
   * logs a short one-liner at WARN. For unexpected errors logs full message and stack at ERROR.
   */
  logError(context: string, error: unknown): void {
    const prismaCode =
      error && typeof error === 'object' && 'code' in error
        ? (error as { code: string }).code
        : undefined;

    if (prismaCode && KNOWN_PRISMA_CLIENT_CODES.includes(prismaCode)) {
      const summary =
        prismaCode === 'P2002'
          ? 'Unique constraint failed'
          : prismaCode === 'P2003'
            ? 'Foreign key constraint failed'
            : 'Record not found';
      this.logger.warn(`[${context}] ${summary} (${prismaCode})`);
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const codeSuffix = prismaCode ? ` Prisma code: ${prismaCode}` : '';
    this.logger.error(`[${context}] ${message}${codeSuffix}`, stack);
  }
}
