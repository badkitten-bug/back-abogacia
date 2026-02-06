import { Module } from '@nestjs/common';
import { LegalDocsService } from './legal-docs.service';
import { LegalDocsController } from './legal-docs.controller';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalDocument } from './entities/legal-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LegalDocument])
  ],
  controllers: [LegalDocsController, AdminController],
  providers: [LegalDocsService],
})
export class LegalDocsModule {}

