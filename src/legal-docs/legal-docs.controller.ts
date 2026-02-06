import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { LegalDocsService } from './legal-docs.service';
import { CreateLegalDocDto } from './dto/create-legal-doc.dto';

@Controller('api/admin/laws')
export class LegalDocsController {
  constructor(private readonly legalDocsService: LegalDocsService) {}

  @Post()
  create(@Body() createLegalDocDto: CreateLegalDocDto) {
    return this.legalDocsService.create(createLegalDocDto);
  }

  @Get()
  findAll() {
    return this.legalDocsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.legalDocsService.remove(id);
  }

  @Post(':id/index')
  index(@Param('id') id: string) {
    return this.legalDocsService.indexDocument(id);
  }
}

