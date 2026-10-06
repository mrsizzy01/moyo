import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-moyo-dark text-white pb-20">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex items-center justify-center min-h-[60vh]">
        <div class="w-10 h-10 border-4 border-moyo-accent border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading && !channel" class="max-w-xl mx-auto py-24 text-center px-4">
        <h2 class="text-2xl font-bold mb-2">Chaîne introuvable</h2>
        <p class="text-moyo-muted mb-6">Cette chaîne n'existe pas ou a été désactivée.</p>
        <a routerLink="/" class="btn-primary inline-block">Retour à l'accueil</a>
      </div>

      <div *ngIf="!isLoading && channel">
        <!-- Channel Banner -->
        <div class="h-48 sm:h-64 md:h-80 w-full relative bg-gradient-to-r from-purple-900 via-indigo-950 to-moyo-dark overflow-hidden">
          <img *ngIf="channel.bannerUrl" [src]="channel.bannerUrl" alt="Bannière" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-moyo-dark via-transparent to-black/30"></div>
        </div>

        <!-- Channel Header Info -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-moyo-border">
            <div class="flex items-end gap-5">
              <!-- Avatar -->
              <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-moyo-accent to-purple-600 p-1 shadow-2xl flex-shrink-0 overflow-hidden">
                <img *ngIf="channel.avatarUrl || channel.user?.avatarUrl"
                     [src]="channel.avatarUrl || channel.user?.avatarUrl"
                     alt="Avatar" class="w-full h-full object-cover rounded-xl" />
                <div *ngIf="!channel.avatarUrl && !channel.user?.avatarUrl"
                     class="w-full h-full bg-moyo-dark rounded-xl flex items-center justify-center text-3xl font-bold text-moyo-accent uppercase">
                  {{ channel.channelName.substring(0, 2) }}
                </div>
              </div>

              <!-- Name & stats -->
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{{ channel.channelName }}</h1>
                  <span *ngIf="channel.isVerified" class="text-moyo-accent" title="Créateur Vérifié">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                  </span>
                </div>
                <div class="flex items-center gap-3 text-xs sm:text-sm text-moyo-muted">
                  <span>&#64;{{ channel.slug }}</span>
                  <span>•</span>
                  <span>{{ subscribersCount }} abonné{{ subscribersCount > 1 ? 's' : '' }}</span>
                  <span>•</span>
                  <span>{{ channel.totalVideos || channel.videos?.length || 0 }} vidéo{{ (channel.totalVideos || channel.videos?.length) > 1 ? 's' : '' }}</span>
                </div>
                <p *ngIf="channel.bio" class="text-xs sm:text-sm text-gray-300 max-w-2xl line-clamp-2 pt-1">{{ channel.bio }}</p>
              </div>
            </div>

            <!-- Follow / Action Button -->
            <div class="flex items-center gap-3">
              <button (click)="toggleFollow()"
                      [ngClass]="isSubscribed ? 'bg-white/10 hover:bg-white/20 text-white' : 'btn-primary'"
                      class="px-6 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2">
                <svg *ngIf="!isSubscribed" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>{{ isSubscribed ? 'Abonné' : "S'abonner" }}</span>
              </button>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="flex border-b border-moyo-border mt-4 gap-8">
            <button *ngFor="let tab of tabs"
                    (click)="activeTab = tab.id"
                    [ngClass]="activeTab === tab.id ? 'border-b-2 border-moyo-accent text-moyo-accent font-semibold' : 'text-moyo-muted hover:text-white'"
                    class="pb-3 text-sm transition-colors uppercase tracking-wider font-medium">
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab: Vidéos -->
          <div *ngIf="activeTab === 'videos'" class="py-8">
            <div *ngIf="!channel.videos || channel.videos.length === 0" class="text-center py-16 text-moyo-muted">
              <p class="text-lg">Aucune vidéo publiée pour le moment.</p>
            </div>
            <div *ngIf="channel.videos && channel.videos.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div *ngFor="let video of channel.videos" class="group flex flex-col space-y-2 cursor-pointer" [routerLink]="['/watch', video.id]">
                <div class="aspect-video rounded-xl overflow-hidden bg-moyo-border relative group-hover:ring-2 group-hover:ring-moyo-accent transition-all shadow-lg">
                  <img *ngIf="video.thumbnailUrl" [src]="video.thumbnailUrl" [alt]="video.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div *ngIf="!video.thumbnailUrl" class="w-full h-full bg-gradient-to-tr from-gray-900 to-gray-800 flex items-center justify-center text-moyo-muted">
                    <svg class="w-10 h-10 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <span *ngIf="video.durationSeconds" class="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                    {{ formatDuration(video.durationSeconds) }}
                  </span>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-white group-hover:text-moyo-accent line-clamp-2 transition-colors">{{ video.title }}</h3>
                  <p class="text-xs text-moyo-muted mt-1">{{ video.viewsCount || 0 }} vues • {{ video.publishedAt | date:'mediumDate' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Séries -->
          <div *ngIf="activeTab === 'series'" class="py-8">
            <div *ngIf="!channel.series || channel.series.length === 0" class="text-center py-16 text-moyo-muted">
              <p class="text-lg">Aucune série créée pour le moment.</p>
            </div>
            <div *ngIf="channel.series && channel.series.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div *ngFor="let s of channel.series" class="glass-panel p-4 rounded-xl border border-moyo-border space-y-3">
                <div class="aspect-video rounded-lg overflow-hidden bg-moyo-border relative">
                  <img *ngIf="s.bannerUrl" [src]="s.bannerUrl" [alt]="s.title" class="w-full h-full object-cover" />
                  <div *ngIf="!s.bannerUrl" class="w-full h-full bg-indigo-950/40 flex items-center justify-center text-moyo-accent font-bold">
                    {{ s.title }}
                  </div>
                </div>
                <h3 class="text-base font-bold text-white">{{ s.title }}</h3>
                <p *ngIf="s.description" class="text-xs text-moyo-muted line-clamp-2">{{ s.description }}</p>
                <div class="text-xs text-moyo-accent font-semibold">
                  {{ s.seasons?.length || 0 }} saison{{ (s.seasons?.length || 0) > 1 ? 's' : '' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Podcasts -->
          <div *ngIf="activeTab === 'podcasts'" class="py-8">
            <div *ngIf="!channel.podcasts || channel.podcasts.length === 0" class="text-center py-16 text-moyo-muted">
              <p class="text-lg">Aucun podcast disponible pour le moment.</p>
            </div>
            <div *ngIf="channel.podcasts && channel.podcasts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div *ngFor="let p of channel.podcasts" class="glass-panel p-4 rounded-xl border border-moyo-border space-y-3">
                <div class="aspect-square rounded-lg overflow-hidden bg-moyo-border">
                  <img *ngIf="p.coverUrl" [src]="p.coverUrl" [alt]="p.title" class="w-full h-full object-cover" />
                  <div *ngIf="!p.coverUrl" class="w-full h-full bg-emerald-950/40 flex items-center justify-center text-emerald-400 font-bold">
                    {{ p.title }}
                  </div>
                </div>
                <h3 class="text-base font-bold text-white">{{ p.title }}</h3>
                <p *ngIf="p.description" class="text-xs text-moyo-muted line-clamp-2">{{ p.description }}</p>
              </div>
            </div>
          </div>

          <!-- Tab: À propos -->
          <div *ngIf="activeTab === 'about'" class="py-8 max-w-3xl space-y-6">
            <div class="glass-panel p-6 rounded-2xl border border-moyo-border space-y-4">
              <h3 class="text-lg font-bold text-white">Description</h3>
              <p class="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{{ channel.bio || "Aucune description fournie par le créateur." }}</p>
            </div>

            <div class="glass-panel p-6 rounded-2xl border border-moyo-border space-y-3 text-sm">
              <h3 class="text-lg font-bold text-white">Informations</h3>
              <div *ngIf="channel.websiteUrl" class="flex items-center gap-3 text-moyo-muted">
                <span class="text-white font-medium">Site Web :</span>
                <a [href]="channel.websiteUrl" target="_blank" rel="noopener" class="text-moyo-accent hover:underline">{{ channel.websiteUrl }}</a>
              </div>
              <div class="flex items-center gap-3 text-moyo-muted">
                <span class="text-white font-medium">Membre depuis :</span>
                <span>{{ channel.createdAt | date:'longDate' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChannelComponent implements OnInit {
  channel: any = null;
  isLoading = true;
  isSubscribed = false;
  subscribersCount = 0;
  activeTab = 'videos';

  tabs = [
    { id: 'videos', label: 'Vidéos' },
    { id: 'series', label: 'Séries' },
    { id: 'podcasts', label: 'Podcasts' },
    { id: 'about', label: 'À propos' },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadChannel(slug);
      }
    });
  }

  loadChannel(slug: string) {
    this.isLoading = true;
    this.apiService.getChannel(slug).subscribe({
      next: (res) => {
        this.channel = res.data;
        this.isSubscribed = res.data.isSubscribed;
        this.subscribersCount = res.data.subscribersCount || 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  toggleFollow() {
    if (!this.authService.isAuthenticated) {
      alert('Veuillez vous connecter pour vous abonner.');
      return;
    }

    if (this.isSubscribed) {
      this.apiService.unfollowCreator(this.channel.id).subscribe({
        next: () => {
          this.isSubscribed = false;
          this.subscribersCount = Math.max(0, this.subscribersCount - 1);
        },
      });
    } else {
      this.apiService.followCreator(this.channel.id).subscribe({
        next: () => {
          this.isSubscribed = true;
          this.subscribersCount++;
        },
      });
    }
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
