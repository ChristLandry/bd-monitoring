import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateConnectionDto } from './create-connection.dto';

export class UpdateConnectionDto extends PartialType(
  OmitType(CreateConnectionDto, ['password'] as const),
) {}
