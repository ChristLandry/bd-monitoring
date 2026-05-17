import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  providers: [EncryptionService, JwtAuthGuard, RolesGuard],
  exports: [EncryptionService, JwtAuthGuard, RolesGuard],
})
export class CommonModule {}
