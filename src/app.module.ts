import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { MqttModule } from './mqtt/mqtt.module';
import { PlacesModule } from './places/places.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SpacesModule } from './spaces/spaces.module';
import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [PrismaModule, AuthModule, CommonModule, MqttModule, PlacesModule, SpacesModule, ReservationsModule, TelemetryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
