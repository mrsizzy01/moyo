import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma Client connected to PostgreSQL');
    } catch (error) {
      this.logger.warn(
        'Prisma could not connect immediately to PostgreSQL. Ensure PostgreSQL is running (e.g. via Docker Compose).'
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
