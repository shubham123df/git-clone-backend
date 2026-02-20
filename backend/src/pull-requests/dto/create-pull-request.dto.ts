import { IsString, IsOptional, IsArray, ValidateNested, MaxLength, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class ChecklistItemDto {
  @IsString()
  label: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}

export class CreatePullRequestDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  repositoryLink: string;

  @IsString()
  sourceBranch: string;

  @IsString()
  targetBranch: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: { label: string; done?: boolean }[];
}
