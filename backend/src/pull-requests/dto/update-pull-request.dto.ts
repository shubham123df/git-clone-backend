import { IsString, IsOptional, IsArray, ValidateNested, MaxLength, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class ChecklistItemDto {
  @IsString()
  label: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}

export class UpdatePullRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  repositoryLink?: string;

  @IsOptional()
  @IsString()
  sourceBranch?: string;

  @IsOptional()
  @IsString()
  targetBranch?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: { label: string; done?: boolean }[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  version?: number;
}
