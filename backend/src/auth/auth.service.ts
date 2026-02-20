import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');
    const developerRole = await this.prisma.role.findFirst({ where: { name: 'DEVELOPER' } });
    if (!developerRole) throw new ConflictException('Roles not seeded. Run seed.');
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name ?? null,
        roleId: developerRole.id,
      },
      include: { role: true },
    });
    const tokens = await this.issueTokens(user.id, user.email);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');
    const tokens = await this.issueTokens(user.id, user.email);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(refreshPayload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: refreshPayload.sub },
      include: { role: true },
    });
    if (!user || user.email !== refreshPayload.email) throw new UnauthorizedException('Invalid refresh token');
    return this.issueTokens(user.id, user.email);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  private async issueTokens(sub: string, email: string) {
    const accessExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    const accessToken = this.jwtService.sign(
      { sub, email },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: accessExpiry },
    );
    const refreshToken = this.jwtService.sign(
      { sub, email },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: refreshExpiry },
    );
    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiry,
    };
  }

  private sanitizeUser(user: { id: string; email: string; name: string | null; role: { id: string; name: string; permissions: string[] } }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      permissions: user.role.permissions,
    };
  }
}
