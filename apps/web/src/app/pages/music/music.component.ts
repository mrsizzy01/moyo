import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AudioPlayerComponent } from '../../components/player/audio-player.component';

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, AudioPlayerComponent],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-white tracking-tight">🎵 Musique</h1>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-4 border-moyo-accent/30 border-t-moyo-accent rounded-full animate-spin"></div>
      </div>

      <div *ngIf="!loading()" class="space-y-10">
        <!-- Currently Playing -->
        <div *ngIf="currentTrack()" class="glass-panel rounded-2xl p-6 border border-moyo-accent/30 space-y-4">
          <h2 class="text-sm font-bold text-moyo-accent uppercase tracking-widest">Lecture en cours</h2>
          <app-audio-player [src]="currentTrack()!.audioUrl" [title]="currentTrack()!.title" [cover]="currentTrack()!.album?.coverUrl"></app-audio-player>
        </div>

        <!-- Artists -->
        <section class="space-y-4">
          <h2 class="text-xl font-bold text-white">Artistes</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div *ngFor="let a of artists()" (click)="selectArtist(a)" class="glass-panel rounded-2xl p-4 text-center border border-moyo-border hover:border-moyo-accent/30 cursor-pointer transition-all group">
              <div class="w-16 h-16 rounded-full bg-moyo-dark border border-moyo-border mx-auto mb-3 overflow-hidden flex items-center justify-center text-2xl">
                <img *ngIf="a.avatarUrl" [src]="a.avatarUrl" [alt]="a.name" class="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform" />
                <span *ngIf="!a.avatarUrl">🎤</span>
              </div>
              <p class="text-xs font-bold text-white truncate">{{ a.name }}</p>
              <p class="text-xs text-moyo-muted">{{ a.albums?.length || 0 }} album(s)</p>
            </div>
          </div>
        </section>

        <!-- Selected Artist Detail -->
        <section *ngIf="selectedArtist()" class="space-y-4">
          <div class="flex items-center gap-3">
            <button (click)="selectedArtist.set(null)" class="text-moyo-muted hover:text-white text-sm">← Retour</button>
            <h2 class="text-xl font-bold text-white">{{ selectedArtist()!.name }}</h2>
          </div>

          <div *ngFor="let album of selectedArtist()!.albums" class="glass-panel rounded-2xl p-4 border border-moyo-border space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-xl overflow-hidden bg-moyo-dark border border-moyo-border shrink-0">
                <img *ngIf="album.coverUrl" [src]="album.coverUrl" [alt]="album.title" class="w-full h-full object-cover" />
                <div *ngIf="!album.coverUrl" class="w-full h-full flex items-center justify-center text-xl">💿</div>
              </div>
              <div>
                <p class="font-bold text-white text-sm">{{ album.title }}</p>
                <p class="text-xs text-moyo-muted">{{ album.year }} · {{ album.tracks?.length || 0 }} piste(s)</p>
              </div>
            </div>

            <!-- Track List -->
            <div class="space-y-1">
              <div *ngFor="let track of album.tracks; let i = index"
                (click)="playTrack(track, album)"
                [class.border-moyo-accent]="currentTrack()?.id === track.id"
                class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent group">
                <span class="text-xs text-moyo-muted w-5 text-center">
                  <span *ngIf="currentTrack()?.id !== track.id">{{ i + 1 }}</span>
                  <span *ngIf="currentTrack()?.id === track.id" class="text-moyo-accent">▶</span>
                </span>
                <div class="flex-1 overflow-hidden">
                  <p class="text-sm font-medium text-white truncate" [class.text-moyo-accent]="currentTrack()?.id === track.id">{{ track.title }}</p>
                  <p class="text-xs text-moyo-muted">{{ formatDuration(track.durationSeconds) }}</p>
                </div>
                <span class="text-xs text-moyo-muted">{{ track.playsCount | number }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Trending Tracks (no artist selected) -->
        <section *ngIf="!selectedArtist()" class="space-y-3">
          <h2 class="text-xl font-bold text-white">Tendances</h2>
          <div class="glass-panel rounded-2xl p-4 border border-moyo-border space-y-1">
            <div *ngFor="let track of trendingTracks(); let i = index"
              (click)="playTrack(track, null)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
              [class.border-l-2]="currentTrack()?.id === track.id" [class.border-moyo-accent]="currentTrack()?.id === track.id">
              <span class="text-xs font-bold text-moyo-muted w-5">{{ i + 1 }}</span>
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-moyo-dark shrink-0 border border-moyo-border">
                <img *ngIf="track.album?.coverUrl" [src]="track.album!.coverUrl" class="w-full h-full object-cover" />
                <div *ngIf="!track.album?.coverUrl" class="w-full h-full flex items-center justify-center text-sm">🎵</div>
              </div>
              <div class="flex-1 overflow-hidden">
                <p class="text-sm font-medium text-white truncate">{{ track.title }}</p>
                <p class="text-xs text-moyo-muted">{{ track.artist?.name }}</p>
              </div>
              <p class="text-xs text-moyo-muted hidden sm:block">{{ formatDuration(track.durationSeconds) }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class MusicPageComponent implements OnInit {
  artists = signal<any[]>([]);
  selectedArtist = signal<any>(null);
  trendingTracks = signal<any[]>([]);
  currentTrack = signal<any>(null);
  loading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    Promise.all([
      this.http.get<any>('http://localhost:3000/api/music/artists').toPromise(),
      this.http.get<any>('http://localhost:3000/api/music/tracks').toPromise(),
    ]).then(([artistsRes, tracksRes]) => {
      this.artists.set(artistsRes?.data || []);
      this.trendingTracks.set(tracksRes?.data || []);
      this.loading.set(false);
    }).catch(() => this.loading.set(false));
  }

  selectArtist(artist: any) {
    this.loading.set(true);
    this.http.get<any>(`http://localhost:3000/api/music/artists/${artist.id}`).subscribe({
      next: res => { this.selectedArtist.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  playTrack(track: any, album: any) {
    this.currentTrack.set({ ...track, album });
  }

  formatDuration(s: number): string {
    if (!s) return '?:??';
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  }
}
