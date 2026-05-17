import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/definitions/model/user-role.enum';
import { ReportsService } from '../services/reports.service';
import { ReportQueryDto } from '../definitions/dto/report.dto';

@ApiTags('Rapports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISEUR)
  @ApiOperation({ summary: 'Générer un rapport (période, format PDF/Excel)' })
  @ApiProduces('application/pdf', 'application/vnd.ms-excel')
  async generate(@Query() dto: ReportQueryDto, @Res() res: Response) {
    const data = await this.service.generate(dto);
    const format = dto.format ?? 'pdf';
    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.send(data);
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.send(data);
    }
  }
}
