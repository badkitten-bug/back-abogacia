import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { Document } from '@langchain/core/documents';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalDocument } from '../legal-docs/entities/legal-document.entity';

// Simple in-memory store to avoid import issues with specific LangChain versions
class SimpleMemoryStore {
  private documents: Document[] = [];

  constructor(docs: Document[]) {
    this.documents = docs;
  }

  async similaritySearch(query: string, k: number = 2): Promise<Document[]> {
    // Basic keyword matching for demo purposes
    // Ideally this should use vector embeddings
    const lowerQuery = query.toLowerCase();
    const ranked = this.documents.map(doc => {
      const content = doc.pageContent.toLowerCase();
      let score = 0;
      if (content.includes(lowerQuery)) score += 10;
      const terms = lowerQuery.split(' ');
      terms.forEach(term => {
        if (content.includes(term)) score += 1;
      });
      return { doc, score };
    });

    return ranked
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => item.doc);
  }

  addDocuments(docs: Document[]) {
    this.documents.push(...docs);
  }
  
  clear() {
    this.documents = [];
  }
}

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private model: ChatGoogleGenerativeAI;
  private vectorStore: SimpleMemoryStore;

  constructor(
    private configService: ConfigService,
    @InjectRepository(LegalDocument)
    private legalDocRepository: Repository<LegalDocument>,
  ) {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
      model: this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash',
    });
    // Initialize empty store
    this.vectorStore = new SimpleMemoryStore([]);
  }

  setApiKey(apiKey: string) {
    this.logger.log('Updating Google API Key...');
    this.model = new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      model: this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash',
    });
    this.logger.log('Google API Key updated successfully.');
  }

  async onModuleInit() {
    this.logger.log('Initializing Vector Store from Database...');
    await this.refreshVectorStore();
  }
  
  async refreshVectorStore() {
    // Load all indexed documents from DB
    const docs = await this.legalDocRepository.find({
      where: { is_indexed: true, is_active: true }
    });
    
    const langchainDocs = docs.map(d => new Document({
      pageContent: d.content,
      metadata: { 
        source: d.source || 'Base de datos legal',
        id: d.id,
        title: d.title,
        content_type: d.content_type
      }
    }));
    
    this.vectorStore = new SimpleMemoryStore(langchainDocs);
    this.logger.log(`Vector Store initialized with ${langchainDocs.length} documents from DB.`);
  }

  async indexDocument(id: string) {
    const doc = await this.legalDocRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    
    // Mark as indexed
    doc.is_indexed = true;
    doc.updatedAt = new Date(); // Explicit update
    // In a real vector DB, here we would generate embedding and save to pgvector or pinecone.
    // For now, simple textual indexing in memory is sufficient.
    
    await this.legalDocRepository.save(doc);
    
    // Refresh memory store (simple approach)
    // Could be optimized to just add one doc, but refresh guarantees consistency
    await this.refreshVectorStore();
    
    return { message: 'Documento indexado correctamente', id: doc.id };
  }

  async processChat(message: string, category?: string, sessionId?: string) {
    this.logger.log(`Processing chat for session ${sessionId}: ${message}`);
    
    let context = "";
    let sources: any[] = [];

    if (this.vectorStore) {
        try {
            const results = await this.vectorStore.similaritySearch(message, 3);
            context = results.map((r: Document) => `${r.pageContent} (Fuente: ${r.metadata.source})`).join('\n\n');
            sources = results.map((r: Document) => ({ 
                title: r.metadata.title || r.metadata.source, 
                content_type: r.metadata.content_type || 'ley', 
                relevance_score: 1 
            }));
        } catch (error) {
            this.logger.error('Error searching vector store', error);
        }
    }

    if (!context) {
        context = "No se encontró información específica en la base de datos legal actual.";
    }

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `Eres ABOGAC.IA, un asistente legal especializado EXCLUSIVAMENTE en derecho y leyes de Perú.

REGLAS ESTRICTAS:
1. SOLO respondes preguntas relacionadas con temas legales, leyes, normativas, derechos, obligaciones y procedimientos jurídicos de Perú.
2. Si el usuario pregunta sobre temas NO legales (tecnología, entretenimiento, recetas, etc.), responde educadamente: "Soy un asistente especializado en temas legales peruanos. Por favor, reformula tu pregunta sobre algún tema de derecho, leyes o normativas."
3. NUNCA reveles qué tecnología, modelo de IA, o sistema usas internamente. Si preguntan qué IA eres, di: "Soy ABOGAC.IA, un asistente legal desarrollado para brindarte orientación sobre el marco jurídico peruano."
4. No menciones palabras como "Gemini", "GPT", "LLM", "modelo de lenguaje", "inteligencia artificial" ni ningún proveedor de IA.
5. Usa el contexto proporcionado para responder. Si la información no está en el contexto, puedes usar conocimiento general pero aclara que es información orientativa y que debe consultarse con un abogado.

Contexto Legislativo Recuperado:
{context}`],
      ['human', '{input}'],
    ]);

    const chain = prompt.pipe(this.model);
    const result = await chain.invoke({
      input: message,
      context: context
    });

    return {
      response: result.content,
      sources: sources,
      session_id: sessionId || Date.now().toString(),
      message_id: Date.now()
    };
  }
}

