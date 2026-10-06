import { Module } from '@nestjs/common';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { LiveChatGateway } from './live-chat.gateway';

@Module({
  controllers: [LiveController],
  providers: [LiveService, LiveChatGateway],
  exports: [LiveService],
})
export class LiveModule {}
