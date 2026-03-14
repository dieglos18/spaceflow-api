import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { PlacesModule } from './places/places.module';
import { PrismaModule } from './prisma/prisma.module';
import { SpacesModule } from './spaces/spaces.module';

@Module({
  imports: [PrismaModule, AuthModule, CommonModule, PlacesModule, SpacesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
