import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PrStatus } from '@prisma/client';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async handleGitHub(signature: string, rawBody: Buffer, body: Record<string, unknown>) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (secret) {
      const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
      if (signature !== expected) throw new UnauthorizedException('Invalid signature');
    }
    const action = body.action as string;
    const pr = body.pull_request as Record<string, unknown> | undefined;
    if (!pr) return { received: true };
    const repoUrl = (pr.html_url as string) ?? '';
    const head = pr.head as { ref?: string } | undefined;
    const branch = head?.ref;
    const state = (pr.state as string) ?? 'open';
    const title = (pr.title as string) ?? '';
    const existing = await this.prisma.pullRequest.findFirst({
      where: { repositoryLink: repoUrl },
      orderBy: { updatedAt: 'desc' },
    });
    if (existing) {
      const statusMap: Record<string, PrStatus> = {
        open: PrStatus.OPEN,
        closed: PrStatus.DEPLOYED,
      };
      const newStatus = statusMap[state] ?? existing.status;
      await this.prisma.pullRequest.update({
        where: { id: existing.id },
        data: { status: newStatus, title, updatedAt: new Date() },
      });
      if (body.check_suite || body.check_run) {
        const suite = body.check_suite as { conclusion?: string } | undefined;
        const run = body.check_run as { conclusion?: string } | undefined;
        const conclusion = suite?.conclusion ?? run?.conclusion;
        const ciPassed = conclusion === 'success';
        await this.prisma.deploymentStatus.upsert({
          where: { pullRequestId: existing.id },
          create: { pullRequestId: existing.id, ciPassed },
          update: { ciPassed },
        });
      }
    }
    return { received: true };
  }

  async handleGitLab(token: string, body: Record<string, unknown>) {
    const secret = process.env.GITLAB_WEBHOOK_SECRET;
    if (secret && token !== secret) throw new UnauthorizedException('Invalid token');
    const objKind = body.object_kind as string;
    const mr = body.object_attributes as Record<string, unknown> | undefined;
    if (!mr || objKind !== 'merge_request') return { received: true };
    const url = (mr.url as string) ?? '';
    const state = (mr.state as string) ?? 'opened';
    const title = (mr.title as string) ?? '';
    const existing = await this.prisma.pullRequest.findFirst({
      where: { repositoryLink: url },
      orderBy: { updatedAt: 'desc' },
    });
    if (existing) {
      const statusMap: Record<string, PrStatus> = {
        opened: PrStatus.OPEN,
        merged: PrStatus.DEPLOYED,
        closed: PrStatus.CHANGES_REQUESTED,
      };
      const newStatus = statusMap[state] ?? existing.status;
      await this.prisma.pullRequest.update({
        where: { id: existing.id },
        data: { status: newStatus, title, updatedAt: new Date() },
      });
    }
    return { received: true };
  }
}
