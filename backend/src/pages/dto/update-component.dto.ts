import { IsObject, IsOptional, IsNumber } from 'class-validator';

export class UpdateComponentDto {
  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  order?: number;
}
