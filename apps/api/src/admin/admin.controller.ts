import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService,
  ) {}

  private async assertAdmin(userId: string) {
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      throw new ForbiddenException('Accès réservé aux administrateurs et modérateurs');
    }
    return user;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques réelles globales de la plateforme' })
  async getStats(@Headers('x-user-id') userId: string) {
    await this.assertAdmin(userId);
    const stats = await this.adminService.getGlobalStats();
    return { success: true, data: stats };
  }

  @Get('users')
  @ApiOperation({ summary: 'Lister les utilisateurs enregistrés' })
  async getUsers(
    @Headers('x-user-id') adminId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    await this.assertAdmin(adminId);
    const result = await this.adminService.getUsers(Number(page), Number(limit), search);
    return { success: true, ...result };
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Modifier le rôle d un utilisateur' })
  async updateUserRole(
    @Param('id') targetUserId: string,
    @Headers('x-user-id') adminId: string,
    @Body('role') role: string,
  ) {
    const admin = await this.assertAdmin(adminId);
    if (admin.role !== 'ADMIN') throw new ForbiddenException('Seul un ADMIN peut modifier les rôles');
    const updated = await this.adminService.updateUserRole(targetUserId, role, adminId);
    return { success: true, data: updated, message: 'Rôle mis à jour' };
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activer ou suspendre un compte utilisateur' })
  async toggleUserStatus(
    @Param('id') targetUserId: string,
    @Headers('x-user-id') adminId: string,
    @Body('isActive') isActive: boolean,
  ) {
    await this.assertAdmin(adminId);
    const updated = await this.adminService.toggleUserStatus(targetUserId, isActive, adminId);
    return {
      success: true,
      data: updated,
      message: isActive ? 'Utilisateur réactivé' : 'Utilisateur suspendu',
    };
  }

  @Get('reports')
  @ApiOperation({ summary: 'Lister les signalements de contenus' })
  async getReports(
    @Headers('x-user-id') adminId: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    await this.assertAdmin(adminId);
    const result = await this.adminService.getReports(status, Number(page), Number(limit));
    return { success: true, ...result };
  }

  @Patch('reports/:id/resolve')
  @ApiOperation({ summary: 'Résoudre un signalement' })
  async resolveReport(
    @Param('id') reportId: string,
    @Headers('x-user-id') adminId: string,
  ) {
    await this.assertAdmin(adminId);
    const updated = await this.adminService.handleReport(reportId, 'RESOLVE', adminId);
    return { success: true, data: updated, message: 'Signalement résolu' };
  }

  @Patch('reports/:id/dismiss')
  @ApiOperation({ summary: 'Rejeter un signalement' })
  async dismissReport(
    @Param('id') reportId: string,
    @Headers('x-user-id') adminId: string,
  ) {
    await this.assertAdmin(adminId);
    const updated = await this.adminService.handleReport(reportId, 'DISMISS', adminId);
    return { success: true, data: updated, message: 'Signalement rejeté' };
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Consulter l historique des logs d audit' })
  async getAuditLogs(
    @Headers('x-user-id') adminId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 30,
  ) {
    await this.assertAdmin(adminId);
    const result = await this.adminService.getAuditLogs(Number(page), Number(limit));
    return { success: true, ...result };
  }
}
