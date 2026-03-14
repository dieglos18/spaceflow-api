import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MqttService } from './mqtt.service';

@Module({
  imports: [PrismaModule, CommonModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
