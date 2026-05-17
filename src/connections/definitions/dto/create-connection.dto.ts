import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { DbType } from '../model/db-type.enum';
import { Environment } from '../model/environment.enum';

export class CreateConnectionDto {
  @ApiProperty({ example: 'PostgreSQL Production' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label: string;

  @ApiProperty({ enum: DbType, example: DbType.POSTGRESQL })
  @IsEnum(DbType)
  type: DbType;

  @ApiProperty({ example: 'db.example.com' })
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiProperty({ example: 5432 })
  @IsInt()
  @Min(1)
  port: number;

  @ApiProperty({ example: 'mydb' })
  @IsString()
  @IsNotEmpty()
  database: string;

  @ApiProperty({ example: 'monitoring_user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'secret' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ enum: Environment, default: Environment.DEV })
  @IsOptional()
  @IsEnum(Environment)
  environment?: Environment;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  sslEnabled?: boolean;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>;
}
