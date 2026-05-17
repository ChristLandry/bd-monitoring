import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactGroupEntity } from './definitions/model/contact-group.entity';
import { ContactGroupsController } from './controllers/contact-groups.controller';
import { ContactGroupsService } from './services/contact-groups.service';
import { ContactGroupRepository } from './services/repository/contact-group.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ContactGroupEntity])],
  controllers: [ContactGroupsController],
  providers: [ContactGroupsService, ContactGroupRepository],
  exports: [ContactGroupsService, ContactGroupRepository],
})
export class ContactGroupsModule {}
