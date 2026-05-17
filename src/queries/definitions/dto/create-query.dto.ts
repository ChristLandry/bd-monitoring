import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateQueryDto {
  @ApiProperty({ example: 'Compteur sessions actives' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label: string;

  @ApiProperty({
    example: 'SELECT COUNT(*) AS val FROM pg_stat_activity WHERE state = :state',
  })
  @IsString()
  @IsNotEmpty()
  corpsRequete: string;

  @ApiPropertyOptional({ example: { state: 'active' } })
  @IsOptional()
  @IsObject()
  parametresDynamiques?: Record<string, unknown>;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  connectionId: string;

  @ApiPropertyOptional({ example: 30, description: 'Timeout en secondes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutMax?: number;
}
