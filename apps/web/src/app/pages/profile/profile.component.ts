import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <!-- Profile Header Card -->
      <div class="glass-panel p-6 sm:p-8 rounded-2xl border border-moyo-border shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div class="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-moyo-accent to-pink-500 p-0.5 flex-shrink-0">
            <div class="w-full h-full bg-moyo-dark rounded-[14px] flex items-center justify-center text-2xl font-bold text-white uppercase overflow-hidden">
              <img *ngIf="currentUser?.avatarUrl" [src]="currentUser?.avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
              <span *ngIf="!currentUser?.avatarUrl">{{ currentUser?.username?.substring(0, 2) || 'MO' }}</span>
            </div>
          </div>
          <div class="space-y-1">
            <h1 class="text-2xl font-extrabold text-white">{{ currentUser?.displayName || currentUser?.username }}</h1>
            <p class="text-sm text-moyo-muted">{{ currentUser?.email }}</p>
            <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-moyo-accent/10 border border-moyo-accent/20 text-moyo-accent">
              Rôle : {{ currentUser?.role }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="logout()" class="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-colors">
            Déconnexion
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-moyo-border gap-8 overflow-x-auto">
        <button *ngFor="let tab of tabs"
                (click)="activeTab = tab.id"
                [ngClass]="activeTab === tab.id ? 'border-b-2 border-moyo-accent text-moyo-accent font-semibold' : 'text-moyo-muted hover:text-white'"
                class="pb-3 text-sm uppercase tracking-wider font-medium whitespace-nowrap transition-colors">
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab: Historique de visionnage -->
      <div *ngIf="activeTab === 'history'" class="space-y-6">
        <div *ngIf="isLoadingHistory" class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-moyo-accent border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div *ngIf="!isLoadingHistory && historyItems.length === 0" class="text-center py-16 text-moyo-muted glass-panel rounded-2xl border border-moyo-border">
          <p class="text-lg mb-2">Aucun historique de visionnage.</p>
          <p class="text-sm text-moyo-muted">Les vidéos que vous regardez apparaîtront ici pour reprendre où vous vous êtes arrêté.</p>
        </div>

        <div *ngIf="!isLoadingHistory && historyItems.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div *ngFor="let item of historyItems" class="group flex flex-col space-y-2 cursor-pointer" [routerLink]="['/watch', item.video?.id]">
            <div class="aspect-video rounded-xl overflow-hidden bg-moyo-border relative shadow-lg">
              <img *ngIf="item.video?.thumbnailUrl" [src]="item.video?.thumbnailUrl" [alt]="item.video?.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div *ngIf="!item.video?.thumbnailUrl" class="w-full h-full bg-moyo-border flex items-center justify-center text-moyo-muted">
                🎬
              </div>
              <!-- Progress Bar -->
              <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                <div class="h-full bg-moyo-accent" [style.width.%]="getProgressPercent(item)"></div>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white group-hover:text-moyo-accent line-clamp-2 transition-colors">{{ item.video?.title }}</h3>
              <p class="text-xs text-moyo-muted mt-1">Reprendre à {{ formatTime(item.progressSeconds) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Mes Playlists -->
      <div *ngIf="activeTab === 'playlists'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">Vos Playlists</h2>
          <button (click)="showNewPlaylistModal = true" class="btn-primary text-xs flex items-center gap-2">
            + Nouvelle Playlist
          </button>
        </div>

        <!-- Modal Création Playlist -->
        <div *ngIf="showNewPlaylistModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div class="glass-panel p-6 rounded-2xl border border-moyo-border w-full max-w-md space-y-4">
            <h3 class="text-lg font-bold text-white">Créer une playlist</h3>
            <input type="text" [(ngModel)]="newPlaylistTitle" placeholder="Titre de la playlist"
                   class="w-full px-4 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white text-sm" />
            <textarea [(ngModel)]="newPlaylistDesc" placeholder="Description optionnelle"
                      class="w-full px-4 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white text-sm"></textarea>
            <div class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="newPlaylistPublic" id="pub" class="rounded bg-moyo-dark text-moyo-accent" />
              <label for="pub" class="text-xs text-gray-300">Playlist publique</label>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button (click)="showNewPlaylistModal = false" class="px-4 py-2 text-sm text-moyo-muted hover:text-white">Annuler</button>
              <button (click)="createPlaylist()" [disabled]="!newPlaylistTitle" class="btn-primary text-sm">Créer</button>
            </div>
          </div>
        </div>

        <div *ngIf="playlists.length === 0" class="text-center py-16 text-moyo-muted glass-panel rounded-2xl border border-moyo-border">
          <p class="text-lg mb-2">Aucune playlist créée.</p>
          <p class="text-sm">Organisez vos vidéos favorites en listes de lecture.</p>
        </div>

        <div *ngIf="playlists.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div *ngFor="let pl of playlists" class="glass-panel p-4 rounded-xl border border-moyo-border space-y-3">
            <div class="aspect-video rounded-lg overflow-hidden bg-moyo-border flex items-center justify-center text-moyo-accent font-bold text-lg">
              📑 {{ pl.title }}
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-white">{{ pl.title }}</h3>
                <p class="text-xs text-moyo-muted">{{ pl._count?.items || 0 }} vidéos</p>
              </div>
              <button (click)="deletePlaylist(pl.id)" class="text-red-400 hover:text-red-300 text-xs">Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Mes Vidéos (Créateur) -->
      <div *ngIf="activeTab === 'videos'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">Mes Vidéos Publiées</h2>
          <a routerLink="/studio" class="btn-primary text-xs flex items-center gap-2">
            + Publier un contenu
          </a>
        </div>

        <div *ngIf="myVideos.length === 0" class="text-center py-16 text-moyo-muted glass-panel rounded-2xl border border-moyo-border">
          <p class="text-lg mb-2">Vous n'avez pas encore publié de vidéo.</p>
          <a routerLink="/studio" class="btn-primary inline-block text-xs mt-3">Aller au Creator Studio</a>
        </div>

        <div *ngIf="myVideos.length > 0" class="divide-y divide-moyo-border border border-moyo-border rounded-2xl overflow-hidden glass-panel">
          <div *ngFor="let v of myVideos" class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-24 aspect-video rounded-lg overflow-hidden bg-moyo-border flex-shrink-0">
                <img *ngIf="v.thumbnailUrl" [src]="v.thumbnailUrl" [alt]="v.title" class="w-full h-full object-cover" />
                <div *ngIf="!v.thumbnailUrl" class="w-full h-full flex items-center justify-center text-xs text-moyo-muted">🎬</div>
              </div>
              <div>
                <h4 class="text-sm font-bold text-white">{{ v.title }}</h4>
                <div class="flex items-center gap-2 text-xs text-moyo-muted mt-0.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold"
                        [ngClass]="v.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'">
                    {{ v.status }}
                  </span>
                  <span>•</span>
                  <span>{{ v.viewsCount || 0 }} vues</span>
                  <span>•</span>
                  <span>{{ v.createdAt | date:'shortDate' }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <a [routerLink]="['/watch', v.id]" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white">Voir</a>
              <button (click)="deleteVideo(v.id)" class="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs text-red-400">Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  activeTab = 'history';

  tabs = [
    { id: 'history', label: 'Historique de visionnage' },
    { id: 'playlists', label: 'Mes Playlists' },
    { id: 'videos', label: 'Mes Vidéos' },
  ];

  historyItems: any[] = [];
  isLoadingHistory = false;

  playlists: any[] = [];
  showNewPlaylistModal = false;
  newPlaylistTitle = '';
  newPlaylistDesc = '';
  newPlaylistPublic = true;

  myVideos: any[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly api: ApiService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.currentUser = this.auth.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadHistory();
    this.loadPlaylists();
    this.loadMyVideos();
  }

  loadHistory() {
    this.isLoadingHistory = true;
    this.api.getWatchHistory().subscribe({
      next: (res) => {
        this.historyItems = res?.data || [];
        this.isLoadingHistory = false;
      },
      error: () => (this.isLoadingHistory = false),
    });
  }

  loadPlaylists() {
    this.api.getMyPlaylists().subscribe({
      next: (res) => (this.playlists = res?.data || []),
    });
  }

  createPlaylist() {
    if (!this.newPlaylistTitle) return;
    this.api.createPlaylist({
      title: this.newPlaylistTitle,
      description: this.newPlaylistDesc,
      isPublic: this.newPlaylistPublic,
    }).subscribe({
      next: () => {
        this.showNewPlaylistModal = false;
        this.newPlaylistTitle = '';
        this.newPlaylistDesc = '';
        this.loadPlaylists();
      },
    });
  }

  deletePlaylist(id: string) {
    if (!confirm('Supprimer cette playlist ?')) return;
    this.api.deletePlaylist(id).subscribe({
      next: () => this.loadPlaylists(),
    });
  }

  loadMyVideos() {
    this.api.getMyVideos().subscribe({
      next: (res) => (this.myVideos = res?.data?.items || res?.data || []),
    });
  }

  deleteVideo(id: string) {
    if (!confirm('Supprimer définitivement cette vidéo ?')) return;
    this.api.deleteVideo(id).subscribe({
      next: () => this.loadMyVideos(),
    });
  }

  getProgressPercent(item: any): number {
    const duration = item.video?.durationSeconds || 1;
    return Math.min(100, Math.round(((item.progressSeconds || 0) / duration) * 100));
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
