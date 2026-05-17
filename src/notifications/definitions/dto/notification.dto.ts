import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationEntity } from '../model/notification.entity';
import { NotificationChannel } from '../../../monitorings/definitions/model/notification-channel.enum';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  monitoringId: string;

  @ApiPropertyOptional()
  executionLogId?: string | null;

  @ApiProperty({ enum: NotificationChannel })
  canal: NotificationChannel;

  @ApiProperty()
  contenu: string;

  @ApiProperty()
  acquittee: boolean;

  @ApiPropertyOptional()
  dateAcquittement?: Date | null;

  @ApiProperty()
  escalade: boolean;

  @ApiProperty()
  dateEnvoi: Date;

  static fromEntity(e: NotificationEntity): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    Object.assign(dto, e);
    return dto;
  }
}
