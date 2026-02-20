import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('pull-requests/:prId/reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Param('prId') prId: string, @CurrentUser() user: { sub: string }, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(prId, user.sub, dto);
  }

  @Get()
  findAll(@Param('prId') prId: string) {
    return this.reviewsService.findAll(prId);
  }

  @Patch(':reviewId')
  update(
    @Param('prId') prId: string,
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(prId, reviewId, user.sub, dto);
  }
}
