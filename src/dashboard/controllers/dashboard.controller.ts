import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
import { DashboardService } from '../services/dashboard.service';
import {
  DashboardFilterDto,
  DashboardResponseDto,
} from '../definitions/dto/dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISEUR,
    UserRole.DEVELOPPEUR,
    UserRole.LECTEUR,
  )
  @ApiOperation({ summary: 'Statistiques globales et synthèse des monitorings' })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  getDashboard(@Query() filters: DashboardFilterDto) {
    return this.service.getDashboard(filters);
  }
}
