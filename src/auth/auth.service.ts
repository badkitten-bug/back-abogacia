import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async login(username: string, pass: string) {
    // Get credentials from Env or use defaults
    const validEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@abogacia.pe';
    const validPass = this.configService.get<string>('ADMIN_PASSWORD') || 'admin123';

    if (username === validEmail && pass === validPass) {
      // Return a mock token for the frontend to save
      return {
        access_token: 'mock-admin-token-' + Date.now(),
        user: {
            email: username,
            role: 'admin'
        }
      };
    }

    throw new UnauthorizedException('Credenciales inválidas');
  }
}
