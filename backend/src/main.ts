import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }))
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3001', // Ajusta según la URL de ngrok
    methods: ['GET', 'POST'],
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, "../public"))
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Servidor escuchando en el puerto: ${port}`)
}
bootstrap();
