import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { BearerAuthGuard } from './bearer-auth.guard';

/**
 * Protects the route with Bearer token authentication.
 * Requires header: Authorization: Bearer <AUTH_BEARER_TOKEN>
 */
export function AuthBearer() {
  return applyDecorators(
    UseGuards(BearerAuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Missing or invalid token' }),
  );
}
