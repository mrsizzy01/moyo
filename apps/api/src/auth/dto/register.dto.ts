import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@moyo.tv', description: 'Adresse e-mail valide' })
  @IsEmail({}, { message: 'L adresse e-mail fournie est invalide' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'moyo_creator', description: 'Nom d utilisateur unique (alphanumérique + underscore)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Le nom d utilisateur doit contenir au moins 3 caractères' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Le nom d utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores',
  })
  username: string;

  @ApiProperty({ example: 'Alex Moyo', description: 'Nom affiché publiquement' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Le nom affiché doit contenir au moins 2 caractères' })
  displayName: string;

  @ApiProperty({ example: 'StrongP@ssw0rd2026', description: 'Mot de passe sécurisé (min 8 caractères)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Le mot de passe doit comporter au moins 8 caractères' })
  password: string;
}
