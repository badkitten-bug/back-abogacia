import { Injectable, Logger } from '@nestjs/common';
import { CreateLegalDocDto } from './dto/create-legal-doc.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { LegalDocument } from './entities/legal-document.entity';

@Injectable()
export class LegalDocsService {
  private readonly logger = new Logger(LegalDocsService.name);
  
  // In-memory store for local testing without DB
  private localLaws: any[] = [];

  constructor(
    // @InjectRepository(LegalDocument)
    // private legalDocRepository: Repository<LegalDocument>,
  ) {}

  async create(createLegalDocDto: CreateLegalDocDto) {
    this.logger.log(`Received new law: ${createLegalDocDto.title}`);

    // 1. Production Logic (Commented out for No-Docker mode)
    /*
    const newDoc = this.legalDocRepository.create({
      ...createLegalDocDto,
      // embedding: await this.generateEmbedding(createLegalDocDto.content) 
    });
    return this.legalDocRepository.save(newDoc);
    */

    // 2. Local Mock Logic
    this.localLaws.push({
      id: Date.now().toString(),
      ...createLegalDocDto,
      createdAt: new Date(),
    });

    this.logger.log(`Law saved locally (In-Memory). Total laws: ${this.localLaws.length}`);
    
    return {
      message: 'Law saved successfully (Simulation)',
      data: createLegalDocDto
    };
  }

  findAll() {
    // return this.legalDocRepository.find();
    return this.localLaws;
  }
}
