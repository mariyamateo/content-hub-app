import { IsArray, IsString } from 'class-validator';

export class ReorderComponentsDto {
  @IsArray()
  @IsString({ each: true })
  order: string[];
}
