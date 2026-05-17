import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContactGroupEntity } from '../model/contact-group.entity';

export class ContactMemberDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}

export class PlageHoraireDto {
  @ApiProperty({ description: '0=dimanche, 6=samedi' })
  jour: number;

  @ApiProperty({ example: '08:00' })
  debut: string;

  @ApiProperty({ example: '18:00' })
  fin: string;
}

export class CreateContactGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [ContactMemberDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactMemberDto)
  members: ContactMemberDto[];

  @ApiPropertyOptional({ type: [PlageHoraireDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlageHoraireDto)
  plagesHoraires?: PlageHoraireDto[];

  @ApiPropertyOptional({ type: [ContactMemberDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactMemberDto)
  remplacants?: ContactMemberDto[];
}

export class UpdateContactGroupDto extends CreateContactGroupDto {}

export class ContactGroupResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  label: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  members: ContactMemberDto[];

  @ApiProperty()
  plagesHoraires: PlageHoraireDto[];

  @ApiProperty()
  remplacants: ContactMemberDto[];

  @ApiProperty()
  dateCreation: Date;

  @ApiProperty()
  dateModification: Date;

  static fromEntity(e: ContactGroupEntity): ContactGroupResponseDto {
    const dto = new ContactGroupResponseDto();
    Object.assign(dto, e);
    return dto;
  }
}
