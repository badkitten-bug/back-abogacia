import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS configuration - allows frontend URL from env or all origins
  const corsOrigins = process.env.CORS_ORIGINS 
    ? JSON.parse(process.env.CORS_ORIGINS) 
    : '*';
  
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Use PORT from environment (required by Render) or default to 8000
  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
bootstrap();
