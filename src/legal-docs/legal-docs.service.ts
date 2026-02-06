import { Injectable, Logger } from '@nestjs/common';
import { CreateLegalDocDto } from './dto/create-legal-doc.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalDocument } from './entities/legal-document.entity';
import { RagService } from '../rag/rag.service';

@Injectable()
export class LegalDocsService {
  private readonly logger = new Logger(LegalDocsService.name);

  constructor(
    @InjectRepository(LegalDocument)
    private legalDocRepository: Repository<LegalDocument>,
    private readonly ragService: RagService,
  ) {}

  async indexDocument(id: string) {
    return this.ragService.indexDocument(id);
  }

  async create(createLegalDocDto: CreateLegalDocDto) {
    this.logger.log(`Creating new legal document: ${createLegalDocDto.title}`);

    const newDoc = this.legalDocRepository.create({
      ...createLegalDocDto,
      is_active: true,
    });
    
    const saved = await this.legalDocRepository.save(newDoc);
    this.logger.log(`Legal document saved with ID: ${saved.id}`);
    
    return {
      message: 'Contenido legal guardado exitosamente',
      data: saved
    };
  }

  async findAll() {
    return this.legalDocRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    return this.legalDocRepository.findOne({ where: { id } });
  }

  async update(id: string, updateData: Partial<CreateLegalDocDto>) {
    await this.legalDocRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.legalDocRepository.delete(id);
    return { message: 'Contenido eliminado exitosamente' };
  }
}

