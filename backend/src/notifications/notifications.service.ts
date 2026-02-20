import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notifications') private readonly queue: Queue,
  ) {}

  async create(
    userId: string,
    payload: { type: string; title: string; body?: string; link?: string; metadata?: object },
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body ?? null,
        link: payload.link ?? null,
        metadata: payload.metadata ?? undefined,
      },
    });
    await this.queue.add('send', { notificationId: notification.id }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
    return notification;
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { data, total, page, limit };
  }

  async markRead(id: string, userId: string) {
    const n = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!n) throw new NotFoundException('Notification not found');
    await this.prisma.notification.update({ where: { id }, data: { read: true } });
    return { message: 'OK' };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId }, data: { read: true } });
    return { message: 'OK' };
  }
}
