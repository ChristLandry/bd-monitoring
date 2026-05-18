import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/definitions/model/user-role.enum';
import { LogsService } from '../services/logs.service';
import {
  ExportFormatQuery,
  LogFilterDto,
  LogResponseDto,
  TrendResponseDto,
} from '../definitions/dto/log.dto';

@ApiTags('Logs d\'exécution')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly service: LogsService) {}

  @Get('export')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISEUR, UserRole.LECTEUR)
  @ApiOperation({ summary: 'Exporter les logs (CSV ou PDF)' })
  @ApiProduces('text/csv', 'application/pdf')
  export(
    @Query() formatQuery: ExportFormatQuery,
    @Query() filters: LogFilterDto,
    @Res() res: Response,
  ) {
    const format = formatQuery.format ?? 'csv';
    const data = this.service.exportLogs(format, filters);
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.send(data);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.send(data);
    }
  }

  @Get('monitoring/:id/trend')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISEUR, UserRole.DEVELOPPEUR, UserRole.LECTEUR)
  @ApiOperation({ summary: 'Série temporelle et détection de dérive' })
  @ApiResponse({ status: 200, type: TrendResponseDto })
  trend(@Param('id') id: string): Promise<TrendResponseDto> {
    return this.service.getTrend(id);
  }

  @Get('monitoring/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISEUR, UserRole.DEVELOPPEUR, UserRole.LECTEUR)
  @ApiOperation({ summary: 'Historique d\'un monitoring' })
  history(@Param('id') id: string): Promise<LogResponseDto[]> {
    return this.service.findByMonitoring(id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISEUR, UserRole.DEVELOPPEUR, UserRole.LECTEUR)
  @ApiOperation({ summary: 'Lister les logs (filtres)' })
  findAll(@Query() filters: LogFilterDto) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISEUR, UserRole.DEVELOPPEUR, UserRole.LECTEUR)
  @ApiOperation({ summary: 'Détail d\'un log' })
  @ApiResponse({ status: 200, type: LogResponseDto })
  findOne(@Param('id') id: string): Promise<LogResponseDto> {
    return this.service.findOne(id);
  }
}
