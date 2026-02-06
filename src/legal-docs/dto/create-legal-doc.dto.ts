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
  @IsOptional()
  content_type?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  source?: string;
}

