import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';
import { CreateTokenDto } from './dto/create-token.dto';

@Injectable()
export class RepositoryTokensService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async setToken(userId: string, dto: CreateTokenDto) {
    const encrypted = this.encryption.encrypt(dto.token);
    await this.prisma.repositoryToken.upsert({
      where: { userId_provider: { userId, provider: dto.provider } },
      create: { userId, provider: dto.provider, encryptedToken: encrypted, scopeHint: dto.scopeHint ?? null },
      update: { encryptedToken: encrypted, scopeHint: dto.scopeHint ?? null },
    });
    return { provider: dto.provider, message: 'Token stored securely. It is never returned in API responses.' };
  }

  async list(userId: string) {
    const tokens = await this.prisma.repositoryToken.findMany({
      where: { userId },
      select: { id: true, provider: true, scopeHint: true, createdAt: true, updatedAt: true },
    });
    return tokens.map((t) => ({ ...t, hasToken: true }));
  }

  async revoke(userId: string, provider: string) {
    const t = await this.prisma.repositoryToken.findFirst({ where: { userId, provider } });
    if (!t) throw new NotFoundException('Token not found');
    await this.prisma.repositoryToken.delete({ where: { id: t.id } });
    return { message: 'Token revoked' };
  }

  async getDecryptedToken(userId: string, provider: string): Promise<string | null> {
    const t = await this.prisma.repositoryToken.findUnique({
      where: { userId_provider: { userId, provider } },
    });
    if (!t) return null;
    return this.encryption.decrypt(t.encryptedToken);
  }
}
