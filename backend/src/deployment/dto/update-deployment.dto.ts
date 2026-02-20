import { IsBoolean, IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateDeploymentDto {
  @IsOptional()
  @IsBoolean()
  ciPassed?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  warnings?: string[];
}
