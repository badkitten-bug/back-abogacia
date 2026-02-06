import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagModule } from './rag/rag.module';
import { LegalDocsModule } from './legal-docs/legal-docs.module';
import { AuthModule } from './auth/auth.module';
import { LegalDocument } from './legal-docs/entities/legal-document.entity';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get('DATABASE_URL');
        
        const isRender = dbUrl && dbUrl.includes('render.com');
        
        return {
          type: 'postgres',
          url: dbUrl,
          entities: [LegalDocument],
          synchronize: true, // Creates tables automatically
          ssl: isRender ? { rejectUnauthorized: false } : false,
          keepConnectionAlive: true,
          connectTimeoutMS: 5000,
          extra: {
            connectionTimeoutMillis: 5000,
          }
        };
      },
      inject: [ConfigService],
    }),
    RagModule,
    LegalDocsModule,
    AuthModule,
  ],


  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

