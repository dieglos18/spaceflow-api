import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const expectedToken = process.env.AUTH_BEARER_TOKEN;

    if (!expectedToken) {
      throw new UnauthorizedException('Server auth not configured');
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    if (token !== expectedToken) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
