import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts: { role?: string; page: number; limit: number; currentUserId?: string }) {
    const where = opts.role ? { role: { name: opts.role } } : {};
    const currentUser = opts.currentUserId ? await this.prisma.user.findUnique({ where: { id: opts.currentUserId }, include: { role: true } }) : null;
    const isAdmin = currentUser?.role.name === 'ADMIN';
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    const data = users.map((u) =>
      isAdmin ? { id: u.id, email: u.email, name: u.name, role: u.role.name, createdAt: u.createdAt }
        : { id: u.id, email: u.email, name: u.name, role: u.role.name }
    );
    return { data, total, page: opts.page, limit: opts.limit };
  }

  async findOne(id: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const current = await this.prisma.user.findUnique({ where: { id: currentUserId }, include: { role: true } });
    if (current?.role.name !== 'ADMIN' && currentUserId !== id) throw new ForbiddenException('Access denied');
    return { id: user.id, email: user.email, name: user.name, role: user.role.name, createdAt: user.createdAt };
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const data: { email?: string; name?: string; roleId?: string; passwordHash?: string } = {};
    if (dto.email != null) data.email = dto.email;
    if (dto.name != null) data.name = dto.name;
    if (dto.roleId != null) data.roleId = dto.roleId;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);
    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
    return { id: updated.id, email: updated.email, name: updated.name, role: updated.role.name };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted' };
  }
}
