import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Monitoring Platform API')
    .setDescription(
      'API REST de surveillance des performances de bases de données : monitorings, requêtes SQL, connexions, logs, notifications et rapports.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentification')
    .addTag('Utilisateurs')
    .addTag('Connexions DB')
    .addTag('Requêtes SQL')
    .addTag('Monitorings')
    .addTag('Logs d\'exécution')
    .addTag('Notifications')
    .addTag('Groupes de contacts')
    .addTag('Dashboard')
    .addTag('Rapports')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  const authDisabled =
    (process.env.AUTH_DISABLED ?? 'false').trim().toLowerCase() === 'true';
  await app.listen(port);
  console.log(`Application démarrée sur http://localhost:${port}`);
  console.log(`Swagger UI : http://localhost:${port}/api/docs`);
  console.log(
    authDisabled
      ? 'AUTH_DISABLED=true — JWT désactivé (aucun token requis)'
      : 'AUTH_DISABLED=false — JWT actif',
  );
}
bootstrap();
