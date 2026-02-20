import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    entityType: string;
    entityId: string;
    action: string;
    userId?: string;
    pullRequestId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.auditLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        userId: params.userId,
        pullRequestId: params.pullRequestId,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
      },
    });
  }

  async findAll(opts: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    pullRequestId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page: number;
    limit: number;
  }) {
    const where: Record<string, unknown> = {};
    if (opts.entityType) where.entityType = opts.entityType;
    if (opts.entityId) where.entityId = opts.entityId;
    if (opts.userId) where.userId = opts.userId;
    if (opts.action) where.action = opts.action;
    if (opts.pullRequestId) where.pullRequestId = opts.pullRequestId;
    if (opts.dateFrom || opts.dateTo) {
      where.createdAt = {};
      if (opts.dateFrom) (where.createdAt as Record<string, Date>).gte = opts.dateFrom;
      if (opts.dateTo) (where.createdAt as Record<string, Date>).lte = opts.dateTo;
    }
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data: logs, total, page: opts.page, limit: opts.limit };
  }
}
