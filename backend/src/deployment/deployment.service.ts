import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrStatus } from '@prisma/client';
import { ReviewDecision } from '@prisma/client';
import { UpdateDeploymentDto } from './dto/update-deployment.dto';

@Injectable()
export class DeploymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly notifications: NotificationsService,
  ) {}

  async getReadiness(prId: string) {
    const pr = await this.prisma.pullRequest.findUnique({
      where: { id: prId },
      include: {
        reviewers: { include: { user: true } },
        reviews: true,
        deploymentStatus: { include: { deployedBy: true } },
      },
    });
    if (!pr) throw new NotFoundException('Pull request not found');
    const checklist = (pr.checklist as { label: string; done?: boolean }[]) ?? [];
    const checklistComplete = checklist.length === 0 || checklist.every((c) => c.done);
    const allApproved = pr.reviewers.length > 0 && pr.reviewers.every((r) => {
      const review = pr.reviews.find((rev) => rev.userId === r.userId);
      return review?.decision === ReviewDecision.APPROVED;
    });
    const hasRejection = pr.reviews.some((r) => r.decision === ReviewDecision.REJECTED);
    const pendingReviewers = pr.reviewers.filter((r) => !pr.reviews.some((rev) => rev.userId === r.userId));
    const ds = pr.deploymentStatus;
    const blockers: string[] = [];
    if (hasRejection) blockers.push('One or more reviews rejected');
    if (!allApproved && pr.reviewers.length > 0) blockers.push('Not all reviewers have approved');
    if (!checklistComplete) blockers.push('Checklist incomplete');
    if (ds?.blockers) blockers.push(...(ds.blockers as string[]));
    const warnings: string[] = (ds?.warnings as string[]) ?? [];
    if (pendingReviewers.length > 0) warnings.push(`${pendingReviewers.length} reviewer(s) pending`);
    const ready = !hasRejection && allApproved && checklistComplete && (ds?.ciPassed !== false) && blockers.length === 0;
    return {
      pullRequestId: prId,
      status: pr.status,
      approvalStatus: allApproved ? 'approved' : hasRejection ? 'rejected' : 'pending',
      pendingReviewers: pendingReviewers.map((r) => ({ id: r.user.id, email: r.user.email, name: r.user.name })),
      reviews: pr.reviews.map((r) => ({ userId: r.userId, decision: r.decision })),
      checklistComplete,
      checklistTotal: checklist.length,
      ciPassed: ds?.ciPassed ?? null,
      blockers,
      warnings,
      ready,
      deployedAt: ds?.deployedAt ?? null,
      deployedBy: ds?.deployedBy ? { id: ds.deployedBy.id, name: ds.deployedBy.name } : null,
    };
  }

  async markReady(prId: string, userId: string) {
    const pr = await this.prisma.pullRequest.findUnique({ where: { id: prId } });
    if (!pr) throw new NotFoundException('Pull request not found');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user || !['ADMIN', 'RELEASE_MANAGER'].includes(user.role.name)) throw new ForbiddenException('Only Release Manager or Admin can mark ready');
    const readiness = await this.getReadiness(prId);
    await this.prisma.deploymentStatus.upsert({
      where: { pullRequestId: prId },
      create: { pullRequestId: prId, ready: readiness.ready },
      update: { ready: readiness.ready },
    });
    if (readiness.ready) {
      await this.prisma.pullRequest.update({ where: { id: prId }, data: { status: PrStatus.READY_FOR_DEPLOYMENT } });
      await this.notifications.create(pr.authorId, {
        type: 'deployment_ready',
        title: `PR ready for deployment: ${pr.title}`,
        link: `/pull-requests/${prId}`,
        metadata: { pullRequestId: prId },
      });
    }
    await this.auditLog.log({
      entityType: 'deployment',
      entityId: prId,
      action: 'mark_ready',
      userId,
      pullRequestId: prId,
      metadata: { ready: readiness.ready },
    });
    return this.getReadiness(prId);
  }

  async markDeployed(prId: string, userId: string) {
    const pr = await this.prisma.pullRequest.findUnique({ where: { id: prId } });
    if (!pr) throw new NotFoundException('Pull request not found');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user || !['ADMIN', 'RELEASE_MANAGER'].includes(user.role.name)) throw new ForbiddenException('Only Release Manager or Admin can mark deployed');
    await this.prisma.pullRequest.update({ where: { id: prId }, data: { status: PrStatus.DEPLOYED } });
    await this.prisma.deploymentStatus.upsert({
      where: { pullRequestId: prId },
      create: { pullRequestId: prId, deployedAt: new Date(), deployedById: userId },
      update: { deployedAt: new Date(), deployedById: userId },
    });
    await this.auditLog.log({
      entityType: 'deployment',
      entityId: prId,
      action: 'deployed',
      userId,
      pullRequestId: prId,
    });
    await this.notifications.create(pr.authorId, {
      type: 'deployed',
      title: `PR deployed: ${pr.title}`,
      link: `/pull-requests/${prId}`,
      metadata: { pullRequestId: prId },
    });
    return this.getReadiness(prId);
  }

  async update(prId: string, userId: string, dto: UpdateDeploymentDto) {
    const pr = await this.prisma.pullRequest.findUnique({ where: { id: prId } });
    if (!pr) throw new NotFoundException('Pull request not found');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user || !['ADMIN', 'RELEASE_MANAGER'].includes(user.role.name)) throw new ForbiddenException('Not authorized');
    await this.prisma.deploymentStatus.upsert({
      where: { pullRequestId: prId },
      create: {
        pullRequestId: prId,
        ciPassed: dto.ciPassed ?? undefined,
        blockers: dto.blockers as object ?? undefined,
        warnings: dto.warnings as object ?? undefined,
      },
      update: {
        ...(dto.ciPassed !== undefined && { ciPassed: dto.ciPassed }),
        ...(dto.blockers !== undefined && { blockers: dto.blockers }),
        ...(dto.warnings !== undefined && { warnings: dto.warnings }),
      },
    });
    return this.getReadiness(prId);
  }
}
