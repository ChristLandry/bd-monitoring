import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/definitions/model/user-role.enum';
import { NotificationsService } from '../services/notifications.service';
import { NotificationResponseDto } from '../definitions/dto/notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISEUR)
  @ApiOperation({ summary: 'Historique des notifications envoyées' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  findAll(): Promise<NotificationResponseDto[]> {
    return this.service.findAll();
  }

  @Post(':id/ack')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISEUR)
  @ApiOperation({ summary: 'Acquitter une alerte' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  acknowledge(@Param('id') id: string): Promise<NotificationResponseDto> {
    return this.service.acknowledge(id);
  }
}
