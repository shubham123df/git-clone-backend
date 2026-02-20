import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PullRequestsService } from './pull-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePullRequestDto } from './dto/create-pull-request.dto';
import { UpdatePullRequestDto } from './dto/update-pull-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignReviewersDto } from './dto/assign-reviewers.dto';
import { PrStatus } from '@prisma/client';

@Controller('pull-requests')
@UseGuards(JwtAuthGuard)
export class PullRequestsController {
  constructor(private readonly pullRequestsService: PullRequestsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DEVELOPER', 'REVIEWER', 'RELEASE_MANAGER')
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreatePullRequestDto) {
    return this.pullRequestsService.create(user.sub, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: { sub: string },
    @Query('status') status?: PrStatus,
    @Query('authorId') authorId?: string,
    @Query('reviewerId') reviewerId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('sort') sort?: string,
  ) {
    return this.pullRequestsService.findAll({
      status,
      authorId,
      reviewerId,
      page: Number(page),
      limit: Math.min(Number(limit), 100),
      sort,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pullRequestsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: { sub: string }, @Body() dto: UpdatePullRequestDto) {
    return this.pullRequestsService.update(id, user.sub, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @CurrentUser() user: { sub: string }, @Body() dto: UpdateStatusDto) {
    return this.pullRequestsService.updateStatus(id, user.sub, dto.status);
  }

  @Post(':id/reviewers')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DEVELOPER', 'REVIEWER', 'RELEASE_MANAGER')
  assignReviewers(@Param('id') id: string, @CurrentUser() user: { sub: string }, @Body() dto: AssignReviewersDto) {
    return this.pullRequestsService.assignReviewers(id, user.sub, dto.userIds);
  }

  @Delete(':id/reviewers/:userId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DEVELOPER', 'REVIEWER', 'RELEASE_MANAGER')
  removeReviewer(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: { sub: string }) {
    return this.pullRequestsService.removeReviewer(id, userId, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.pullRequestsService.remove(id, user.sub);
  }
}
