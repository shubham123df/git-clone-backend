import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Processor('notifications')
export class NotificationsProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('send')
  async handleSend(job: Job<{ notificationId: string }>) {
    const { notificationId } = job.data;
    const notification = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification) return;
    // In-app notification is already created. Here you can:
    // - Send email via SendGrid/SES
    // - Post to Slack webhook
    // For now we only have in-app; no-op.
    return { done: true };
  }
}
