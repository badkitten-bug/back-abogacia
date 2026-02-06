import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalDocument } from '../legal-docs/entities/legal-document.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([LegalDocument])
  ],
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService]
})
export class RagModule {}
