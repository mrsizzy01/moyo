import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@moyo.tv ou username', description: 'Adresse email ou nom d utilisateur' })
  @IsString()
  @IsNotEmpty({ message: 'L identifiant (email ou nom d utilisateur) est requis' })
  identifier: string;

  @ApiProperty({ example: 'StrongP@ssw0rd2026', description: 'Mot de passe du compte' })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}
