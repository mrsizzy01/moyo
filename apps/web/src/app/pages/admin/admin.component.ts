import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <!-- Admin Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-moyo-border">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
            Moyo Console d'Administration
          </div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Supervision & Modération</h1>
          <p class="text-sm text-moyo-muted mt-1">
            Gérez l'ensemble des utilisateurs, modérez les contenus signalés et visualisez les indicateurs d'activité en temps réel.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-mono text-emerald-400 font-semibold">Instance Active & Connectée</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-moyo-border gap-8 overflow-x-auto">
        <button *ngFor="let tab of tabs"
                (click)="activeTab = tab.id"
                [ngClass]="activeTab === tab.id ? 'border-b-2 border-moyo-accent text-moyo-accent font-semibold' : 'text-moyo-muted hover:text-white'"
                class="pb-3 text-sm uppercase tracking-wider font-medium whitespace-nowrap transition-colors">
          {{ tab.label }}
          <span *ngIf="tab.id === 'reports' && pendingReportsCount > 0"
                class="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold">
            {{ pendingReportsCount }}
          </span>
        </button>
      </div>

      <!-- Tab: Vue d'ensemble (Stats) -->
      <div *ngIf="activeTab === 'overview'" class="space-y-8">
        <div *ngIf="isLoadingStats" class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-moyo-accent border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div *ngIf="!isLoadingStats && stats" class="space-y-6">
          <!-- KPI Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="glass-panel p-5 rounded-2xl border border-moyo-border space-y-1">
              <span class="text-xs text-moyo-muted font-medium uppercase tracking-wider">Utilisateurs enregistrés</span>
              <div class="text-3xl font-black text-white">{{ stats.users?.total || 0 }}</div>
              <div class="text-xs text-moyo-accent font-medium">{{ stats.users?.creators || 0 }} chaînes de créateurs</div>
            </div>

            <div class="glass-panel p-5 rounded-2xl border border-moyo-border space-y-1">
              <span class="text-xs text-moyo-muted font-medium uppercase tracking-wider">Vidéos publiées</span>
              <div class="text-3xl font-black text-white">{{ stats.content?.publishedVideos || 0 }}</div>
              <div class="text-xs text-gray-400">sur {{ stats.content?.totalVideos || 0 }} téléversées au total</div>
            </div>

            <div class="glass-panel p-5 rounded-2xl border border-moyo-border space-y-1">
              <span class="text-xs text-moyo-muted font-medium uppercase tracking-wider">Vues cumulées</span>
              <div class="text-3xl font-black text-white">{{ stats.engagement?.totalViews || 0 }}</div>
              <div class="text-xs text-pink-400">{{ stats.engagement?.totalLikes || 0 }} mentions j'aime</div>
            </div>

            <div class="glass-panel p-5 rounded-2xl border border-moyo-border space-y-1">
              <span class="text-xs text-moyo-muted font-medium uppercase tracking-wider">Signalements en attente</span>
              <div class="text-3xl font-black" [ngClass]="stats.moderation?.pendingReports > 0 ? 'text-red-400' : 'text-emerald-400'">
                {{ stats.moderation?.pendingReports || 0 }}
              </div>
              <div class="text-xs text-moyo-muted">file de modération prioritaire</div>
            </div>
          </div>

          <!-- Content breakdown row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div class="text-2xl font-bold text-white">{{ stats.content?.totalSeries || 0 }}</div>
              <div class="text-xs text-moyo-muted mt-1">📺 Séries & Saisons</div>
            </div>
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div class="text-2xl font-bold text-white">{{ stats.content?.totalTracks || 0 }}</div>
              <div class="text-xs text-moyo-muted mt-1">🎵 Morceaux de musique</div>
            </div>
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div class="text-2xl font-bold text-white">{{ stats.content?.totalPodcasts || 0 }}</div>
              <div class="text-xs text-moyo-muted mt-1">🎙️ Podcasts</div>
            </div>
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div class="text-2xl font-bold text-white">{{ stats.content?.totalLives || 0 }}</div>
              <div class="text-xs text-moyo-muted mt-1">🔴 Diffusions Live</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Modération (Signalements) -->
      <div *ngIf="activeTab === 'reports'" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-white">File des signalements</h2>
          <select [(ngModel)]="selectedReportFilter" (change)="loadReports()"
                  class="px-3 py-1.5 rounded-xl bg-moyo-dark border border-moyo-border text-white text-xs">
            <option value="">Tous les signalements</option>
            <option value="PENDING">En attente</option>
            <option value="RESOLVED">Résolus</option>
            <option value="DISMISSED">Rejetés</option>
          </select>
        </div>

        <div *ngIf="reports.length === 0" class="text-center py-16 text-moyo-muted glass-panel rounded-2xl border border-moyo-border">
          <p class="text-base">Aucun signalement correspondant à ce filtre.</p>
        </div>

        <div *ngIf="reports.length > 0" class="divide-y divide-moyo-border border border-moyo-border rounded-2xl overflow-hidden glass-panel">
          <div *ngFor="let rep of reports" class="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      [ngClass]="{
                        'bg-red-500/20 text-red-400': rep.status === 'PENDING',
                        'bg-emerald-500/20 text-emerald-400': rep.status === 'RESOLVED',
                        'bg-gray-500/20 text-gray-400': rep.status === 'DISMISSED'
                      }">
                  {{ rep.status }}
                </span>
                <span class="text-xs font-semibold text-white">Motif : {{ rep.reason }}</span>
              </div>
              <p class="text-xs text-gray-300">Cible : <span class="font-mono text-moyo-accent">{{ rep.targetType }} #{{ rep.targetId }}</span></p>
              <p *ngIf="rep.details" class="text-xs text-moyo-muted italic">"{{ rep.details }}"</p>
              <p class="text-[10px] text-moyo-muted">Signalé par &#64;{{ rep.reporter?.username }} le {{ rep.createdAt | date:'short' }}</p>
            </div>

            <div *ngIf="rep.status === 'PENDING'" class="flex items-center gap-2">
              <button (click)="resolveReport(rep.id)" class="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                Résoudre
              </button>
              <button (click)="dismissReport(rep.id)" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-moyo-muted text-xs font-medium">
                Rejeter
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Gestion des Utilisateurs -->
      <div *ngIf="activeTab === 'users'" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-white">Utilisateurs enregistrés</h2>
          <input type="text" [(ngModel)]="userSearch" (input)="loadUsers()" placeholder="Rechercher par pseudo ou email..."
                 class="px-4 py-2 rounded-xl bg-moyo-dark border border-moyo-border text-xs text-white placeholder-moyo-muted w-full sm:w-72" />
        </div>

        <div class="overflow-x-auto border border-moyo-border rounded-2xl glass-panel">
          <table class="w-full text-left text-xs">
            <thead class="bg-white/5 text-moyo-muted uppercase tracking-wider border-b border-moyo-border">
              <tr>
                <th class="p-3.5">Utilisateur</th>
                <th class="p-3.5">Email</th>
                <th class="p-3.5">Rôle</th>
                <th class="p-3.5">Statut</th>
                <th class="p-3.5">Créé le</th>
                <th class="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-moyo-border text-gray-300">
              <tr *ngFor="let u of users" class="hover:bg-white/[0.02]">
                <td class="p-3.5 font-semibold text-white">
                  {{ u.displayName || u.username }}
                  <span *ngIf="u.creatorProfile" class="text-[10px] text-moyo-accent block">&#64;{{ u.creatorProfile.channelName }}</span>
                </td>
                <td class="p-3.5 font-mono text-[11px]">{{ u.email }}</td>
                <td class="p-3.5">
                  <select [ngModel]="u.role" (ngModelChange)="changeRole(u.id, $event)"
                          class="px-2 py-1 rounded-lg bg-moyo-dark border border-moyo-border text-white text-[11px]">
                    <option value="VIEWER">VIEWER</option>
                    <option value="CREATOR">CREATOR</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td class="p-3.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold"
                        [ngClass]="u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'">
                    {{ u.isActive ? 'Actif' : 'Suspendu' }}
                  </span>
                </td>
                <td class="p-3.5 text-moyo-muted">{{ u.createdAt | date:'shortDate' }}</td>
                <td class="p-3.5 text-right">
                  <button (click)="toggleUser(u.id, !u.isActive)"
                          class="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                          [ngClass]="u.isActive ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'">
                    {{ u.isActive ? 'Suspendre' : 'Réactiver' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Logs d'Audit -->
      <div *ngIf="activeTab === 'audit'" class="space-y-6">
        <h2 class="text-lg font-bold text-white">Traçabilité & Logs d'Audit</h2>

        <div *ngIf="auditLogs.length === 0" class="text-center py-16 text-moyo-muted glass-panel rounded-2xl border border-moyo-border">
          <p class="text-base">Aucun log d'audit enregistré.</p>
        </div>

        <div *ngIf="auditLogs.length > 0" class="divide-y divide-moyo-border border border-moyo-border rounded-2xl overflow-hidden glass-panel text-xs">
          <div *ngFor="let log of auditLogs" class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div class="space-y-0.5">
              <span class="font-bold text-moyo-accent font-mono">{{ log.action }}</span>
              <p class="text-gray-300">
                Ressource : <span class="font-mono text-white">{{ log.resource }}</span>
                <span *ngIf="log.resourceId"> (ID: {{ log.resourceId }})</span>
              </p>
              <p class="text-[10px] text-moyo-muted">Exécuté par &#64;{{ log.user?.username }} ({{ log.user?.email }})</p>
            </div>
            <span class="text-[11px] text-moyo-muted whitespace-nowrap">{{ log.createdAt | date:'medium' }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  activeTab = 'overview';
  stats: any = null;
  isLoadingStats = false;
  pendingReportsCount = 0;

  reports: any[] = [];
  selectedReportFilter = '';

  users: any[] = [];
  userSearch = '';

  auditLogs: any[] = [];

  tabs = [
    { id: 'overview', label: "Vue d'ensemble" },
    { id: 'reports', label: 'Modération' },
    { id: 'users', label: 'Utilisateurs' },
    { id: 'audit', label: "Logs d'Audit" },
  ];

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    const user = this.auth.currentUser;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      alert('Accès refusé. Cette section est réservée aux administrateurs.');
      this.router.navigate(['/']);
      return;
    }

    this.loadStats();
    this.loadReports();
    this.loadUsers();
    this.loadAuditLogs();
  }

  loadStats() {
    this.isLoadingStats = true;
    this.api.getAdminStats().subscribe({
      next: (res) => {
        this.stats = res.data;
        this.pendingReportsCount = res.data?.moderation?.pendingReports || 0;
        this.isLoadingStats = false;
      },
      error: () => (this.isLoadingStats = false),
    });
  }

  loadReports() {
    this.api.getAdminReports(this.selectedReportFilter || undefined).subscribe({
      next: (res) => (this.reports = res.items || []),
    });
  }

  resolveReport(id: string) {
    this.api.resolveReport(id).subscribe({
      next: () => {
        this.loadReports();
        this.loadStats();
      },
    });
  }

  dismissReport(id: string) {
    this.api.dismissReport(id).subscribe({
      next: () => {
        this.loadReports();
        this.loadStats();
      },
    });
  }

  loadUsers() {
    this.api.getAdminUsers(1, 20, this.userSearch || undefined).subscribe({
      next: (res) => (this.users = res.items || []),
    });
  }

  changeRole(userId: string, role: string) {
    this.api.updateUserRole(userId, role).subscribe({
      next: () => this.loadUsers(),
    });
  }

  toggleUser(userId: string, isActive: boolean) {
    this.api.toggleUserStatus(userId, isActive).subscribe({
      next: () => this.loadUsers(),
    });
  }

  loadAuditLogs() {
    this.api.getAdminAuditLogs().subscribe({
      next: (res) => (this.auditLogs = res.items || []),
    });
  }
}
