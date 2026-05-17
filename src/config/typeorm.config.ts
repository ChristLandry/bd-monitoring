import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfigFactory = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('DB_HOST', 'localhost'),
  port: config.get<number>('DB_PORT', 5432),
  username: config.get<string>('DB_USERNAME', 'monitoring'),
  password: config.get<string>('DB_PASSWORD', 'monitoring'),
  database: config.get<string>('DB_DATABASE', 'monitoring_platform'),
  autoLoadEntities: true,
  synchronize: config.get<string>('NODE_ENV') !== 'production',
  logging: config.get<string>('NODE_ENV') === 'development',
});
