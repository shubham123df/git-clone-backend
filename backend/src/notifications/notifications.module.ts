import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsController } from './notifications.controller';
import { SseController } from './sse.controller';
import { NotificationsService } from './notifications.service';
import { SseService } from './sse.service';
import { NotificationsProcessor } from './notifications.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: { removeOnComplete: 100 },
    }),
  ],
  controllers: [NotificationsController, SseController],
  providers: [NotificationsService, SseService, NotificationsProcessor],
  exports: [NotificationsService, SseService],
})
export class NotificationsModule {}
