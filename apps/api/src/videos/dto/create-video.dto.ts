import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { MediaType, ContentLicense } from '@moyo/types';

export class CreateVideoDto {
  @ApiProperty({ example: 'Le Voyage de Moyo', description: 'Titre du film ou de la vidéo' })
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  title: string;

  @ApiProperty({ example: 'Court métrage d animation indépendant...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: MediaType, example: MediaType.MOVIE })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @ApiProperty({ enum: ContentLicense, example: ContentLicense.CC_BY_SA })
  @IsEnum(ContentLicense)
  license: ContentLicense;

  @ApiProperty({ example: 'originals/video-uuid.mp4', description: 'Clé du fichier original sur MinIO/S3' })
  @IsString()
  @IsNotEmpty({ message: 'La clé de stockage du fichier source est requise' })
  originalKey: string;

  @ApiProperty({ example: 'https://minio.local/thumbnails/thumb.jpg', required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}
