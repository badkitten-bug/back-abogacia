import { Controller, Get, UseGuards } from '@nestjs/common';
import { LegalDocsService } from './legal-docs.service';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly legalDocsService: LegalDocsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    const docs = await this.legalDocsService.findAll();
    
    // Calculate real stats from DB
    const totalDocs = docs.length;
    const indexedDocs = docs.filter(d => d.metadata?.indexed).length; // Assuming metadata store this
    const pendingDocs = totalDocs - indexedDocs;

    return {
      content: {
        total: totalDocs,
        indexed: indexedDocs,
        pending: pendingDocs,
      },
      // Mock stats for modules not yet implemented fully or connected to this controller
      users: {
        total: 12,
        admins: 2,
      },
      directory: {
        lawyers: 5,
        verified_lawyers: 3,
        law_firms: 1,
      },
      chat: {
        sessions: 24,
        messages: 156,
      }
    };
  }
}
