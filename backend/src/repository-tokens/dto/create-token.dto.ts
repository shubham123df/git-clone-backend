import { IsString, IsIn, IsOptional } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  token: string;

  @IsIn(['GITHUB', 'GITLAB'])
  provider: 'GITHUB' | 'GITLAB';

  @IsOptional()
  @IsString()
  scopeHint?: string;
}
