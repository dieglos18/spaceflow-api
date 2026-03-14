import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { ErrorLoggerService } from '../common/error-logger.service';
import { PrismaService } from '../prisma/prisma.service';

const TELEMETRY_TOPIC = 'sites/+/offices/+/telemetry';
const CONTEXT = 'MqttService';

interface TelemetryPayload {
  ts?: string;
  temp_c?: number;
  humidity_pct?: number;
  co2_ppm?: number;
  occupancy?: number;
  power_w?: number;
}

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: MqttClient | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorLogger: ErrorLoggerService,
  ) {}

  onModuleInit(): void {
    const url = process.env.MQTT_BROKER_URL;
    if (!url) {
      this.logger.warn('MQTT_BROKER_URL not set; MQTT client will not connect');
      return;
    }

    try {
      const clientId = process.env.MQTT_CLIENT_ID ?? 'spaceflow-api';
      this.client = connect(url, {
        clientId,
        reconnectPeriod: 5000,
      });

      this.client.on('connect', () => {
        this.client!.subscribe(TELEMETRY_TOPIC, { qos: 1 }, (err) => {
          if (err) {
            this.errorLogger.logError(`${CONTEXT}.subscribe`, err);
          }
        });
      });

      this.client.on('message', (topic: string, payload: Buffer) => {
        this.handleTelemetryMessage(topic, payload).catch((err) => {
          this.errorLogger.logError(`${CONTEXT}.handleTelemetryMessage`, err);
        });
      });

      this.client.on('error', (err) => {
        this.errorLogger.logError(`${CONTEXT}.client`, err);
      });
    } catch (err) {
      this.errorLogger.logError(`${CONTEXT}.onModuleInit`, err);
    }
  }

  onModuleDestroy(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  private async handleTelemetryMessage(topic: string, payload: Buffer): Promise<void> {
    const parts = topic.split('/');
    if (parts.length < 5 || parts[0] !== 'sites' || parts[2] !== 'offices' || parts[4] !== 'telemetry') {
      return;
    }
    const officeId = parts[3];
    const spaceId = officeId;

    let data: TelemetryPayload;
    try {
      data = JSON.parse(payload.toString()) as TelemetryPayload;
    } catch {
      this.errorLogger.logError(CONTEXT, new Error(`Invalid JSON on topic ${topic}`));
      return;
    }

    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      this.errorLogger.logError(CONTEXT, new Error(`Space not found: ${spaceId}`));
      return;
    }

    const ts = data.ts ? new Date(data.ts) : new Date();
    const peopleCount = typeof data.occupancy === 'number' ? data.occupancy : 0;

    try {
      await this.prisma.telemetry.create({
        data: {
          spaceId,
          peopleCount,
          temperature: data.temp_c ?? null,
          humidity: data.humidity_pct ?? null,
          co2: data.co2_ppm ?? null,
          battery: null,
          timestamp: ts,
        },
      });
    } catch (err) {
      this.errorLogger.logError(`${CONTEXT}.telemetry.create`, err);
    }
  }
}
