import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('media')
  @ApiOperation({ summary: 'Uploader un fichier média vers MinIO (retourne la clé d objet)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 * 1024 } }))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Body('folder') folder: string = 'uploads',
  ) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    if (!userId) throw new BadRequestException('userId requis');

    this.logger.log(`Upload reçu : ${file.originalname} (${Math.round(file.size / 1024 / 1024)}MB) par ${userId}`);

    const result = await this.uploadService.uploadToMinio(file, folder, userId);

    return {
      success: true,
      data: result,
      message: 'Fichier uploadé. Vous pouvez maintenant créer votre contenu avec cette clé d objet.',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('thumbnail')
  @ApiOperation({ summary: 'Uploader une miniature (image JPEG/PNG/WebP)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadThumbnail(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');

    const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMime.includes(file.mimetype)) {
      throw new BadRequestException('Format non supporté. Utilisez JPEG, PNG ou WebP.');
    }

    const result = await this.uploadService.uploadToMinio(file, 'thumbnails', userId);

    return {
      success: true,
      data: result,
      message: 'Miniature uploadée avec succès.',
      timestamp: new Date().toISOString(),
    };
  }
}
