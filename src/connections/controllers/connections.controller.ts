import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { ConnectionsService } from '../services/connections.service';
import { CreateConnectionDto } from '../definitions/dto/create-connection.dto';
import { UpdateConnectionDto } from '../definitions/dto/update-connection.dto';
import {
  ConnectionResponseDto,
  ConnectionTestResponseDto,
} from '../definitions/dto/connection-response.dto';

@ApiTags('Connexions DB')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly service: ConnectionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPEUR)
  @ApiOperation({ summary: 'Enregistrer une connexion DB' })
  @ApiResponse({ status: 201, type: ConnectionResponseDto })
  create(@Body() dto: CreateConnectionDto): Promise<ConnectionResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISEUR,
    UserRole.DEVELOPPEUR,
    UserRole.LECTEUR,
  )
  @ApiOperation({ summary: 'Lister les connexions' })
  @ApiResponse({ status: 200, type: [ConnectionResponseDto] })
  findAll(): Promise<ConnectionResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISEUR,
    UserRole.DEVELOPPEUR,
    UserRole.LECTEUR,
  )
  @ApiOperation({ summary: 'Détail d\'une connexion' })
  @ApiResponse({ status: 200, type: ConnectionResponseDto })
  findOne(@Param('id') id: string): Promise<ConnectionResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPEUR)
  @ApiOperation({ summary: 'Modifier une connexion' })
  @ApiResponse({ status: 200, type: ConnectionResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateConnectionDto,
  ): Promise<ConnectionResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer une connexion' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }

  @Post(':id/test')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPEUR, UserRole.SUPERVISEUR)
  @ApiOperation({ summary: 'Tester la connectivité en temps réel' })
  @ApiResponse({ status: 200, type: ConnectionTestResponseDto })
  test(@Param('id') id: string): Promise<ConnectionTestResponseDto> {
    return this.service.test(id);
  }
}
