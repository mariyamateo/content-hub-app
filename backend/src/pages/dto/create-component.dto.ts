import { IsNotEmpty, IsEnum, IsObject } from 'class-validator';

export class CreateComponentDto {
  @IsEnum(['hero', 'text', 'image', 'button', 'gallery', 'cta'])
  @IsNotEmpty()
  type: string;

  @IsObject()
  properties: Record<string, any>;
}
