import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { SseService } from './sse.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notifications') private readonly queue: Queue,
    private readonly sseService: SseService,
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

    // Send real-time notification via SSE
    this.sseService.sendToUser(userId, {
      type: 'notification',
      data: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        link: notification.link,
        read: notification.read,
        createdAt: notification.createdAt,
      },
    });

    // Also queue for email/push notifications
    await this.queue.add('send', { notificationId: notification.id }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
    
    return notification;
  }

  async notifyPullRequestCreated(prId: string, authorId: string, title: string) {
    // Find all managers and admins
    const managers = await this.prisma.user.findMany({
      where: {
        role: {
          name: { in: ['ADMIN', 'MANAGER'] }
        }
      },
      select: { id: true }
    });

    const managerIds = managers.map(m => m.id).filter(id => id !== authorId);

    // Send notifications to all managers
    const notifications = await Promise.all(
      managerIds.map(managerId =>
        this.create(managerId, {
          type: 'pull_request_created',
          title: 'New Pull Request Created',
          body: `${title} has been created and needs your attention`,
          link: `/pull-requests/${prId}`,
          metadata: { pullRequestId: prId, authorId },
        })
      )
    );

    return notifications;
  }

  async notifyPullRequestUpdated(prId: string, authorId: string, title: string, status?: string) {
    // Find all reviewers and managers
    const pr = await this.prisma.pullRequest.findUnique({
      where: { id: prId },
      include: {
        reviewers: {
          include: { user: { select: { id: true } } }
        }
      }
    });

    if (!pr) return;

    const reviewerIds = pr.reviewers.map(r => r.user.id).filter(id => id !== authorId);
    
    // Also notify managers
    const managers = await this.prisma.user.findMany({
      where: {
        role: {
          name: { in: ['ADMIN', 'MANAGER'] }
        }
      },
      select: { id: true }
    });

    const managerIds = managers.map(m => m.id).filter(id => id !== authorId);
    const allNotifyIds = [...new Set([...reviewerIds, ...managerIds])];

    const notifications = await Promise.all(
      allNotifyIds.map(userId =>
        this.create(userId, {
          type: 'pull_request_updated',
          title: status ? `Pull Request ${status}` : 'Pull Request Updated',
          body: `${title} has been updated${status ? ` to ${status}` : ''}`,
          link: `/pull-requests/${prId}`,
          metadata: { pullRequestId: prId, authorId, status },
        })
      )
    );

    return notifications;
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
