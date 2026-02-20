import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(prId: string, userId: string, dto: CreateCommentDto) {
    const pr = await this.prisma.pullRequest.findUnique({ where: { id: prId }, include: { reviewers: true } });
    if (!pr) throw new NotFoundException('Pull request not found');
    const comment = await this.prisma.comment.create({
      data: {
        pullRequestId: prId,
        userId,
        body: dto.body,
        reviewId: dto.reviewId ?? null,
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    const toNotify = [...new Set([pr.authorId, ...pr.reviewers.map((r) => r.userId)].filter((id) => id !== userId))];
    for (const uid of toNotify) {
      await this.notifications.create(uid, {
        type: 'comment_added',
        title: `New comment on PR: ${pr.title}`,
        body: dto.body.slice(0, 100),
        link: `/pull-requests/${prId}`,
        metadata: { pullRequestId: prId, commentId: comment.id },
      });
    }
    return comment;
  }

  async findAll(prId: string, page = 1, limit = 50) {
    const pr = await this.prisma.pullRequest.findUnique({ where: { id: prId } });
    if (!pr) throw new NotFoundException('Pull request not found');
    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { pullRequestId: prId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, email: true, name: true } }, review: true },
      }),
      this.prisma.comment.count({ where: { pullRequestId: prId } }),
    ]);
    return { data, total, page, limit };
  }

  async update(commentId: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenException('You can only edit your own comment');
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { body: dto.body },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (comment.userId !== userId && user?.role.name !== 'ADMIN') throw new ForbiddenException('Not authorized');
    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Deleted' };
  }
}
