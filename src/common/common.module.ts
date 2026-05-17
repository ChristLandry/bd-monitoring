import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { HttpLoggingMiddleware } from './middleware/http-logging.middleware';

@Global()
@Module({
  providers: [EncryptionService, JwtAuthGuard, RolesGuard, HttpLoggingMiddleware],
  exports: [EncryptionService, JwtAuthGuard, RolesGuard, HttpLoggingMiddleware],
})
export class CommonModule {}
