import { Injectable } from '@nestjs/common';
import { LogsService } from '../../logs/services/logs.service';
import { ReportQueryDto } from '../definitions/dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly logsService: LogsService) {}

  async generate(dto: ReportQueryDto): Promise<Buffer | string> {
    const logs = await this.logsService.findAll({
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      page: 1,
      limit: 1000,
    });
    const content = JSON.stringify(logs, null, 2);
    if (dto.format === 'excel') {
      return `Rapport Excel (${dto.dateFrom} - ${dto.dateTo})\n${content}`;
    }
    return Buffer.from(`Rapport PDF (${dto.dateFrom} - ${dto.dateTo})\n${content}`);
  }
}
