import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateLegalDocDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsNotEmpty()
  source: string; // e.g. "Ley 30512 Art 1"
}
