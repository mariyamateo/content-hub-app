import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;
}
