import { IsEnum, IsOptional, IsString } from 'class-validator';

export class TrackEventDto {
  @IsEnum(['view', 'click'])
  eventType: string;

  @IsString()
  @IsOptional()
  componentId?: string;

  @IsString()
  @IsOptional()
  componentType?: string;
}
