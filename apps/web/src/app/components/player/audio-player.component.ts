import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AudioTrackInfo {
  id: string;
  title: string;
  artistName: string;
  coverUrl?: string;
  audioUrl: string;
}

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="currentTrack" class="fixed bottom-0 inset-x-0 z-50 glass-panel border-t border-moyo-border p-3 shadow-2xl backdrop-blur-xl">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <!-- Informations Morceau -->
        <div class="flex items-center gap-3 min-w-[200px]">
          <div class="w-12 h-12 rounded-lg bg-moyo-card border border-moyo-border overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img *ngIf="currentTrack.coverUrl" [src]="currentTrack.coverUrl" [alt]="currentTrack.title" class="w-full h-full object-cover" />
            <svg *ngIf="!currentTrack.coverUrl" class="w-6 h-6 text-moyo-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
            </svg>
          </div>
          <div class="truncate">
            <div class="text-sm font-semibold text-white truncate">{{ currentTrack.title }}</div>
            <div class="text-xs text-moyo-muted truncate">{{ currentTrack.artistName }}</div>
          </div>
        </div>

        <!-- Contrôles Principaux & Progression -->
        <div class="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          <div class="flex items-center gap-4">
            <button (click)="togglePlay()" class="w-9 h-9 rounded-full bg-moyo-accent flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-moyo-accent/30">
              <svg *ngIf="!isPlaying" class="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg *ngIf="isPlaying" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>
          </div>

          <div class="w-full flex items-center gap-2 text-[10px] text-moyo-muted font-mono">
            <span>{{ formatTime(currentTime) }}</span>
            <div class="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative" (click)="seek($event)">
              <div class="absolute left-0 top-0 bottom-0 bg-moyo-accent rounded-full" [style.width.%]="progressPercent"></div>
            </div>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- Contrôles Volume -->
        <div class="hidden sm:flex items-center gap-2 min-w-[120px] justify-end">
          <svg class="w-4 h-4 text-moyo-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
          </svg>
          <input type="range" min="0" max="1" step="0.05" [value]="volume" (input)="onVolumeChange($event)" class="w-20 h-1 bg-white/30 accent-moyo-accent cursor-pointer" />
        </div>
      </div>

      <audio
        #audioTag
        [src]="currentTrack.audioUrl"
        (timeupdate)="onTimeUpdate($event)"
        (loadedmetadata)="onLoadedMetadata($event)"
        (ended)="onEnded()"
      ></audio>
    </div>
  `
})
export class AudioPlayerComponent {
  @Input() currentTrack: AudioTrackInfo | null = null;

  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progressPercent = 0;
  volume = 1;

  togglePlay() {
    this.isPlaying = !this.isPlaying;
  }

  seek(event: MouseEvent) {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    this.currentTime = pos * this.duration;
  }

  onVolumeChange(event: Event) {
    this.volume = parseFloat((event.target as HTMLInputElement).value);
  }

  onTimeUpdate(event: Event) {
    const audio = event.target as HTMLAudioElement;
    this.currentTime = audio.currentTime;
    if (audio.duration) {
      this.progressPercent = (audio.currentTime / audio.duration) * 100;
    }
  }

  onLoadedMetadata(event: Event) {
    const audio = event.target as HTMLAudioElement;
    this.duration = audio.duration || 0;
  }

  onEnded() {
    this.isPlaying = false;
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
