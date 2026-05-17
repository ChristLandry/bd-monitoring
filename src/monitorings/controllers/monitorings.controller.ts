import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { MonitoringsService } from '../services/monitorings.service';
import {
  CreateMonitoringDto,
  MonitoringFilterDto,
  MonitoringResponseDto,
  UpdateMonitoringDto,
} from '../definitions/dto/monitoring.dto';

@ApiTags('Monitorings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('monitorings')
export class MonitoringsController {
  constructor(private readonly service: MonitoringsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPEUR)
  @ApiOperation({ summary: 'Créer un monitoring' })
  @ApiResponse({ status: 201, type: MonitoringResponseDto })
  create(@Body() dto: CreateMonitoringDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISEUR,
    UserRole.DEVELOPPEUR,
    UserRole.LECTEUR,
  )
  @ApiOperation({ summary: 'Lister les monitorings (filtres)' })
  findAll(@Query() filters: MonitoringFilterDto) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISEUR,
    UserRole.DEVELOPPEUR,
    UserRole.LECTEUR,
  )
  @ApiOperation({ summary: 'Détail d\'un monitoring' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPEUR)
  @ApiOperation({ summary: 'Modifier (reschedule si cron change)' })
  update(@Param('id') id: string, @Body() dto: UpdateMonitoringDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer un monitoring' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }

  @Post(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPEUR)
  @ApiOperation({ summary: 'Activer le monitoring' })
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPEUR)
  @ApiOperation({ summary: 'Désactiver le monitoring' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Post(':id/run')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPEUR, UserRole.SUPERVISEUR)
  @ApiOperation({ summary: 'Exécution manuelle immédiate' })
  run(@Param('id') id: string) {
    return this.service.runNow(id);
  }
}
