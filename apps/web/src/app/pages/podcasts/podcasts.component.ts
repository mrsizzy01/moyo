import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AudioPlayerComponent } from '../../components/player/audio-player.component';
import { AudioPlayerService } from '../../services/audio-player.service';

@Component({
  selector: 'app-podcasts',
  standalone: true,
  imports: [CommonModule, AudioPlayerComponent],
  template: `
    <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <h1 class="text-3xl font-bold text-white tracking-tight">🎙️ Podcasts</h1>

      <!-- Loading -->
      <div *ngIf="loading()" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="glass-panel rounded-2xl p-4 border border-moyo-border animate-pulse space-y-3">
          <div class="w-full h-36 bg-white/5 rounded-xl"></div>
          <div class="h-4 bg-white/5 rounded w-3/4"></div>
          <div class="h-3 bg-white/5 rounded w-1/2"></div>
        </div>
      </div>

      <div *ngIf="!loading()" class="space-y-8">
        <!-- Podcast list / selected detail -->
        <div *ngIf="!selectedPodcast()" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div *ngFor="let p of podcasts()" (click)="openPodcast(p)"
            class="glass-panel rounded-2xl overflow-hidden border border-moyo-border hover:border-moyo-accent/30 cursor-pointer transition-all group">
            <div class="w-full h-36 bg-moyo-dark flex items-center justify-center text-5xl border-b border-moyo-border overflow-hidden">
              <img *ngIf="p.coverUrl" [src]="p.coverUrl" [alt]="p.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <span *ngIf="!p.coverUrl">🎙️</span>
            </div>
            <div class="p-4 space-y-1">
              <p class="font-bold text-white text-sm truncate">{{ p.title }}</p>
              <p class="text-xs text-moyo-muted">{{ p.creator?.channelName }}</p>
              <p class="text-xs text-moyo-muted">{{ p._count?.episodes || 0 }} épisode(s)</p>
            </div>
          </div>

          <div *ngIf="podcasts().length === 0" class="col-span-full text-center py-16 glass-panel rounded-2xl border border-moyo-border">
            <p class="text-4xl mb-3">🎙️</p>
            <p class="text-white font-semibold">Aucun podcast disponible</p>
          </div>
        </div>

        <!-- Podcast Detail -->
        <div *ngIf="selectedPodcast()" class="space-y-4">
          <div class="flex items-center gap-3">
            <button (click)="selectedPodcast.set(null)" class="text-moyo-muted hover:text-white text-sm transition-colors">← Retour</button>
            <h2 class="text-xl font-bold text-white">{{ selectedPodcast()!.title }}</h2>
          </div>

          <div class="glass-panel rounded-2xl p-5 border border-moyo-border space-y-1">
            <div *ngFor="let ep of selectedPodcast()!.episodes; let i = index"
              (click)="playEpisode(ep)"
              class="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group border border-transparent"
              [class.border-moyo-accent]="playingEpisode()?.id === ep.id">
              <div class="w-8 h-8 rounded-full bg-moyo-card border border-moyo-border flex items-center justify-center text-xs font-bold text-moyo-muted shrink-0 group-hover:border-moyo-accent/30 transition-colors">
                <span *ngIf="playingEpisode()?.id !== ep.id">{{ ep.episodeNumber || i+1 }}</span>
                <span *ngIf="playingEpisode()?.id === ep.id" class="text-moyo-accent">▶</span>
              </div>
              <div class="flex-1 overflow-hidden">
                <p class="text-sm font-medium text-white truncate" [class.text-moyo-accent]="playingEpisode()?.id === ep.id">{{ ep.title }}</p>
                <p *ngIf="ep.description" class="text-xs text-moyo-muted line-clamp-1 mt-0.5">{{ ep.description }}</p>
                <p class="text-xs text-moyo-muted mt-1">{{ formatDuration(ep.durationSeconds) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PodcastsPageComponent implements OnInit {
  podcasts = signal<any[]>([]);
  selectedPodcast = signal<any>(null);
  playingEpisode = signal<any>(null);
  loading = signal(true);

  constructor(
    private http: HttpClient,
    private audioService: AudioPlayerService,
  ) {}

  ngOnInit() {
    this.http.get<any>('http://localhost:3000/api/podcasts').subscribe({
      next: res => { this.podcasts.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openPodcast(podcast: any) {
    this.http.get<any>(`http://localhost:3000/api/podcasts/${podcast.id}`).subscribe(res => {
      this.selectedPodcast.set(res.data);
    });
  }

  playEpisode(ep: any) {
    this.playingEpisode.set(ep);
    this.audioService.playTrack({
      id: ep.id,
      title: ep.title,
      artistName: this.selectedPodcast()?.title || 'Podcast Moyo',
      coverUrl: this.selectedPodcast()?.coverUrl,
      audioUrl: ep.audioUrl,
    });
  }

  formatDuration(s: number): string {
    if (!s) return '';
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}min`;
    return `${m} min`;
  }
}
