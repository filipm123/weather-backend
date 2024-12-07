import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'https://weather-frontend-lnjh.onrender.com/', // Allow requests from your frontend's URL
    methods: 'GET,POST,PUT,DELETE', // Allow these HTTP methods
    allowedHeaders: 'Content-Type, Authorization', // Allow these headers
  });

  const config = new DocumentBuilder()
    .setTitle('Weather and Energy API')
    .setDescription(
      'Endpoints to fetch weather data and calculate energy generation',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
