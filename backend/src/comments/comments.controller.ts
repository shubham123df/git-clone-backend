import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('pull-requests/:prId/comments')
  create(@Param('prId') prId: string, @CurrentUser() user: { sub: string }, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(prId, user.sub, dto);
  }

  @Get('pull-requests/:prId/comments')
  findAll(@Param('prId') prId: string, @Query('page') page = 1, @Query('limit') limit = 50) {
    return this.commentsService.findAll(prId, Number(page), Math.min(Number(limit), 100));
  }

  @Patch('comments/:id')
  update(@Param('id') id: string, @CurrentUser() user: { sub: string }, @Body() dto: UpdateCommentDto) {
    return this.commentsService.update(id, user.sub, dto);
  }

  @Delete('comments/:id')
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.commentsService.remove(id, user.sub);
  }
}
