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
import { ContactGroupsService } from '../services/contact-groups.service';
import {
  CreateContactGroupDto,
  ContactGroupResponseDto,
  UpdateContactGroupDto,
} from '../definitions/dto/contact-group.dto';

@ApiTags('Groupes de contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contact-groups')
export class ContactGroupsController {
  constructor(private readonly service: ContactGroupsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un groupe de contacts' })
  @ApiResponse({ status: 201, type: ContactGroupResponseDto })
  create(@Body() dto: CreateContactGroupDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISEUR, UserRole.DEVELOPPEUR)
  @ApiOperation({ summary: 'Lister les groupes' })
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier (membres, plages, remplaçants)' })
  update(@Param('id') id: string, @Body() dto: UpdateContactGroupDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer un groupe' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}
