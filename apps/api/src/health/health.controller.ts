import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Vérification de santé des services de la plateforme Moyo' })
  @ApiResponse({ status: 200, description: 'Rapport d état des composants système' })
  async checkHealth() {
    let databaseStatus = 'DISCONNECTED';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'CONNECTED';
    } catch {
      databaseStatus = 'UNAVAILABLE_OR_REQUIRES_CONFIGURATION';
    }

    return {
      status: 'OK',
      platform: 'Moyo Multimédia Platform',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      services: {
        api: 'ONLINE',
        database: databaseStatus,
        redis: process.env.REDIS_HOST ? 'CONFIGURED' : 'UNCONFIGURED',
        minio: process.env.S3_ENDPOINT ? 'CONFIGURED' : 'UNCONFIGURED',
      },
    };
  }
}
