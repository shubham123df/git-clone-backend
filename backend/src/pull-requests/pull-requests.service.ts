import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrStatus } from '@prisma/client';
import { CreatePullRequestDto } from './dto/create-pull-request.dto';
import { UpdatePullRequestDto } from './dto/update-pull-request.dto';

const STATUS_ORDER: PrStatus[] = [
  PrStatus.OPEN,
  PrStatus.IN_REVIEW,
  PrStatus.CHANGES_REQUESTED,
  PrStatus.APPROVED,
  PrStatus.READY_FOR_DEPLOYMENT,
  PrStatus.DEPLOYED,
];

@Injectable()
export class PullRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(authorId: string, dto: CreatePullRequestDto) {
    const pr = await this.prisma.pullRequest.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        repositoryLink: dto.repositoryLink,
        sourceBranch: dto.sourceBranch,
        targetBranch: dto.targetBranch,
        checklist: (dto.checklist ?? []) as object,
        authorId,
      },
      include: { author: { include: { role: true } }, reviewers: { include: { user: true } } },
    });
    await this.auditLog.log({
      entityType: 'pull_request',
      entityId: pr.id,
      action: 'created',
      userId: authorId,
      pullRequestId: pr.id,
      metadata: { title: pr.title },
    });
    return pr;
  }

  async findAll(opts: {
    status?: PrStatus;
    authorId?: string;
    reviewerId?: string;
    page: number;
    limit: number;
    sort?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (opts.status) where.status = opts.status;
    if (opts.authorId) where.authorId = opts.authorId;
    if (opts.reviewerId) (where as any).reviewers = { some: { userId: opts.reviewerId } };
    const orderBy = opts.sort === 'updated' ? { updatedAt: 'desc' as const } : { createdAt: 'desc' as const };
    const [data, total] = await Promise.all([
      this.prisma.pullRequest.findMany({
        where,
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
        orderBy,
        include: {
          author: { select: { id: true, email: true, name: true } },
          reviewers: { include: { user: { select: { id: true, email: true, name: true } } } },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.pullRequest.count({ where }),
    ]);
    return { data, total, page: opts.page, limit: opts.limit };
  }

  async findOne(id: string) {
    const pr = await this.prisma.pullRequest.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, email: true, name: true } },
        reviewers: { include: { user: { select: { id: true, email: true, name: true } } } },
        reviews: { include: { user: { select: { id: true, email: true, name: true } } } },
        deploymentStatus: true,
        comments: { include: { user: { select: { id: true, email: true, name: true } } } },
      },
    });
    if (!pr) throw new NotFoundException('Pull request not found');
    return pr;
  }

  async update(id: string, userId: string, dto: UpdatePullRequestDto) {
    const pr = await this.prisma.pullRequest.findUnique({ where: { id } });
    if (!pr) throw new NotFoundException('Pull request not found');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (user?.role.name !== 'ADMIN' && pr.authorId !== userId) throw new ForbiddenException('Not authorized to update this PR');
    if (dto.version != null && pr.version !== dto.version) throw new ConflictException('PR was updated by someone else');
    const updateData: Record<string, unknown> = {};
    if (dto.title != null) updateData.title = dto.title;
    if (dto.description != null) updateData.description = dto.description;
    if (dto.repositoryLink != null) updateData.repositoryLink = dto.repositoryLink;
    if (dto.sourceBranch != null) updateData.sourceBranch = dto.sourceBranch;
    if (dto.targetBranch != null) updateData.targetBranch = dto.targetBranch;
    if (dto.checklist != null) updateData.checklist = dto.checklist;
    if (Object.keys(updateData).length > 0) updateData.version = pr.version + 1;
    const updated = await this.prisma.pullRequest.update({
      where: { id },
      data: updateData,
      include: { author: { include: { role: true } }, reviewers: { include: { user: true } } },
    });
    await this.auditLog.log({
      entityType: 'pull_request',
      entityId: id,
      action: 'updated',
      userId,
      pullRequestId: id,
    });
    return updated;
  }

  async updateStatus(id: string, userId: string, status: PrStatus) {
    const pr = await this.prisma.pullRequest.findUnique({ where: { id }, include: { reviewers: true } });
    if (!pr) throw new NotFoundException('Pull request not found');
    const toIdx = STATUS_ORDER.indexOf(status);
    if (toIdx < 0) throw new ConflictException('Invalid status');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    const canChange = user?.role.name === 'ADMIN' || pr.authorId === userId || pr.reviewers?.some((r) => r.userId === userId);
    if (!canChange) throw new ForbiddenException('Not authorized to change status');
    const updated = await this.prisma.pullRequest.update({
      where: { id },
      data: { status, version: pr.version + 1 },
      include: { author: true, reviewers: { include: { user: true } } },
    });
    await this.auditLog.log({
      entityType: 'pull_request',
      entityId: id,
      action: 'status_change',
      userId,
      pullRequestId: id,
      metadata: { from: pr.status, to: status },
    });
    return updated;
  }

  async assignReviewers(id: string, userId: string, userIds: string[]) {
    const pr = await this.prisma.pullRequest.findUnique({ where: { id }, include: { reviewers: true } });
    if (!pr) throw new NotFoundException('Pull request not found');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user || !['ADMIN', 'DEVELOPER', 'REVIEWER', 'RELEASE_MANAGER'].includes(user.role.name)) throw new ForbiddenException('Not authorized');
    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.some((uid) => uid === userId)) throw new ForbiddenException('You cannot assign yourself as a reviewer');
    const existing = new Set(pr.reviewers.map((r) => r.userId));
    const toAdd = uniqueIds.filter((uid) => !existing.has(uid));
    for (const uid of toAdd) {
      await this.prisma.reviewer.create({ data: { pullRequestId: id, userId: uid } });
      await this.notifications.create(uid, {
        type: 'reviewer_assigned',
        title: 'Reviewer assigned',
        body: `You were assigned to review PR: ${pr.title}`,
        link: `/pull-requests/${id}`,
        metadata: { pullRequestId: id },
      });
    }
    await this.auditLog.log({
      entityType: 'pull_request',
      entityId: id,
      action: 'reviewers_assigned',
      userId,
      pullRequestId: id,
      metadata: { userIds: toAdd },
    });
    return this.findOne(id);
  }

  async removeReviewer(prId: string, reviewerUserId: string, currentUserId: string) {
    const pr = await this.prisma.pullRequest.findUnique({ where: { id: prId } });
    if (!pr) throw new NotFoundException('Pull request not found');
    const user = await this.prisma.user.findUnique({ where: { id: currentUserId }, include: { role: true } });
    if (user?.role.name !== 'ADMIN' && pr.authorId !== currentUserId) throw new ForbiddenException('Not authorized');
    await this.prisma.reviewer.deleteMany({ where: { pullRequestId: prId, userId: reviewerUserId } });
    return this.findOne(prId);
  }

  async remove(id: string, userId: string) {
    const pr = await this.prisma.pullRequest.findUnique({ where: { id } });
    if (!pr) throw new NotFoundException('Pull request not found');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (user?.role.name !== 'ADMIN' && (pr.authorId !== userId || pr.status !== PrStatus.OPEN)) throw new ForbiddenException('Not authorized to delete');
    await this.prisma.pullRequest.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
