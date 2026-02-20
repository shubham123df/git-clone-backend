import { IsEnum } from 'class-validator';
import { PrStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(PrStatus)
  status: PrStatus;
}
