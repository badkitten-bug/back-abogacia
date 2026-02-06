import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RagService } from './rag.service';

class ChatDto {
  message: string;
  category?: string;
  session_id?: string;
}

@Controller('api/chat')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async chat(@Body() chatDto: ChatDto) {
    return this.ragService.processChat(
      chatDto.message, 
      chatDto.category,
      chatDto.session_id
    );
  }


  @Post('config')
  @HttpCode(HttpStatus.OK)
  updateConfig(@Body() body: { apiKey: string }) {
    if (body.apiKey) {
      this.ragService.setApiKey(body.apiKey);
      return { message: 'API Key updated successfully' };
    }
    return { message: 'No API Key provided' };
  }

}
