import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReviewDecision } from '@prisma/client';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(prId: string, userId: string, dto: CreateReviewDto) {
    const pr = await this.prisma.pullRequest.findUnique({
      where: { id: prId },
      include: { author: true, reviewers: true },
    });
    if (!pr) throw new NotFoundException('Pull request not found');
    if (pr.authorId === userId && dto.decision === 'APPROVED') throw new ForbiddenException('PR author cannot approve their own PR');
    const isReviewer = pr.reviewers.some((r) => r.userId === userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user || (!isReviewer && user.role.name !== 'ADMIN')) throw new ForbiddenException('Only assigned reviewers can submit a review');
    const existing = await this.prisma.review.findUnique({ where: { pullRequestId_userId: { pullRequestId: prId, userId } } });
    if (existing) throw new ConflictException('You have already submitted a review; use update');
    const review = await this.prisma.review.create({
      data: { pullRequestId: prId, userId, decision: dto.decision, body: dto.body ?? null },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    await this.auditLog.log({
      entityType: 'review',
      entityId: review.id,
      action: dto.decision.toLowerCase(),
      userId,
      pullRequestId: prId,
      metadata: { decision: dto.decision },
    });
    await this.notifications.create(pr.authorId, {
      type: 'review_submitted',
      title: `Review ${dto.decision}: ${pr.title}`,
      body: dto.body ?? undefined,
      link: `/pull-requests/${prId}`,
      metadata: { pullRequestId: prId, decision: dto.decision },
    });
    return review;
  }

  async findAll(prId: string) {
    const pr = await this.prisma.pullRequest.findUnique({ where: { id: prId } });
    if (!pr) throw new NotFoundException('Pull request not found');
    return this.prisma.review.findMany({
      where: { pullRequestId: prId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(prId: string, reviewId: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findFirst({ where: { id: reviewId, pullRequestId: prId }, include: { pullRequest: { select: { authorId: true } } } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException('You can only update your own review');
    const newDecision = dto.decision ?? review.decision;
    if (review.pullRequest.authorId === userId && newDecision === 'APPROVED') throw new ForbiddenException('PR author cannot approve their own PR');
    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { decision: newDecision, body: dto.body !== undefined ? dto.body : review.body },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    await this.auditLog.log({
      entityType: 'review',
      entityId: reviewId,
      action: 'updated',
      userId,
      pullRequestId: prId,
      metadata: { decision: updated.decision },
    });
    return updated;
  }
}
