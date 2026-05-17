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
import { QueriesService } from '../services/queries.service';
import { CreateQueryDto } from '../definitions/dto/create-query.dto';
import { UpdateQueryDto } from '../definitions/dto/update-query.dto';
import { QueryFilterDto } from '../definitions/dto/query-filter.dto';
import { QueryResponseDto } from '../definitions/dto/query-response.dto';

@ApiTags('Requêtes SQL')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('queries')
export class QueriesController {
  constructor(private readonly service: QueriesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPEUR)
  @ApiOperation({ summary: 'Créer une requête SQL' })
  @ApiResponse({ status: 201, type: QueryResponseDto })
  create(@Body() dto: CreateQueryDto): Promise<QueryResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISEUR,
    UserRole.DEVELOPPEUR,
    UserRole.LECTEUR,
  )
  @ApiOperation({ summary: 'Lister les requêtes (filtrables)' })
  findAll(@Query() filters: QueryFilterDto) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISEUR,
    UserRole.DEVELOPPEUR,
    UserRole.LECTEUR,
  )
  @ApiOperation({ summary: 'Détail + historique des versions' })
  @ApiResponse({ status: 200, type: QueryResponseDto })
  findOne(@Param('id') id: string): Promise<QueryResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPEUR)
  @ApiOperation({ summary: 'Mettre à jour (incrémente la version)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQueryDto,
  ): Promise<QueryResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPEUR)
  @ApiOperation({ summary: 'Supprimer si non utilisée' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }
}
