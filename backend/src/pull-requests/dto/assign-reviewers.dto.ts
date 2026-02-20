import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class AssignReviewersDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  userIds: string[];
}
