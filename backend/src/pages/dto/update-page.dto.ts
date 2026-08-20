import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdatePageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(['draft', 'published'])
  @IsOptional()
  status?: string;
}
