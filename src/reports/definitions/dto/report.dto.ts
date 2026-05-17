import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class ReportQueryDto {
  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  dateFrom: string;

  @ApiProperty({ example: '2026-05-17' })
  @IsDateString()
  dateTo: string;

  @ApiPropertyOptional({ enum: ['pdf', 'excel'], default: 'pdf' })
  @IsOptional()
  @IsEnum(['pdf', 'excel'])
  format?: 'pdf' | 'excel';
}
