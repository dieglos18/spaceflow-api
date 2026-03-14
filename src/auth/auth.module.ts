import { Global, Module } from '@nestjs/common';
import { BearerAuthGuard } from './bearer-auth.guard';

@Global()
@Module({
  providers: [BearerAuthGuard],
  exports: [BearerAuthGuard],
})
export class AuthModule {}
