import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReviewDecision } from '@prisma/client';

export class UpdateReviewDto {
  @IsOptional()
  @IsEnum(ReviewDecision)
  decision?: ReviewDecision;

  @IsOptional()
  @IsString()
  body?: string;
}
