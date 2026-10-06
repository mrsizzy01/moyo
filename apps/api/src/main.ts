import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('MoyoBootstrap');
  const app = await NestFactory.create(AppModule);

  // Préfixe global d'API
  app.setGlobalPrefix('api');

  // CORS sécurisé
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:4200'],
    credentials: true,
  });

  // Cookies
  app.use(cookieParser());

  // Validation stricte des DTOs (interdiction des propriétés superflues)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Documentation OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('Moyo API')
    .setDescription(
      'Documentation officielle de l API REST Moyo — Regarder. Écouter. Créer. Diffuser.'
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Moyo API en écoute sur http://localhost:${port}/api`);
  logger.log(`📚 Documentation Swagger accessible sur http://localhost:${port}/api/docs`);
}

bootstrap();
