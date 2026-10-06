import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';

export interface QualityLevel {
  index: number;
  height: number;
  label: string;
  bitrate: number;
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group select-none shadow-2xl border border-moyo-border" #playerContainer>
      <!-- HTML5 Video Element -->
      <video
        #videoElement
        class="w-full h-full object-contain cursor-pointer"
        [poster]="posterUrl"
        (click)="togglePlay()"
        (timeupdate)="onTimeUpdate()"
        (loadedmetadata)="onLoadedMetadata()"
        (ended)="onEnded()"
        playsinline
      ></video>

      <!-- Overlay Spinner quand la vidéo charge / bufférise -->
      <div *ngIf="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
        <div class="w-12 h-12 border-4 border-moyo-accent/30 border-t-moyo-accent rounded-full animate-spin"></div>
      </div>

      <!-- Erreur de lecture explicite -->
      <div *ngIf="errorMessage" class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
        <div class="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <p class="text-sm font-semibold text-white">{{ errorMessage }}</p>
        <p class="text-xs text-moyo-muted mt-1 max-w-sm">Vérifiez que le manifest HLS (.m3u8) est bien accessible.</p>
      </div>

      <!-- Barre de Contrôles Personnalisée (Apparaît au survol ou en pause) -->
      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
        <!-- Barre de progression (Timeline) -->
        <div class="relative w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full cursor-pointer transition-all" (click)="seek($event)">
          <div class="absolute left-0 top-0 bottom-0 bg-moyo-accent rounded-full" [style.width.%]="progressPercent"></div>
        </div>

        <div class="flex items-center justify-between text-white text-xs pt-1">
          <!-- Contrôles Gauche : Play/Pause, Volume, Timer -->
          <div class="flex items-center gap-4">
            <button (click)="togglePlay()" class="hover:text-moyo-accent transition-colors" [title]="isPlaying ? 'Pause' : 'Lecture'">
              <svg *ngIf="!isPlaying" class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg *ngIf="isPlaying" class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>

            <!-- Volume Slider -->
            <div class="flex items-center gap-1.5">
              <button (click)="toggleMute()" class="hover:text-moyo-accent transition-colors">
                <svg *ngIf="isMuted || volume === 0" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
                <svg *ngIf="!isMuted && volume > 0" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
              <input type="range" min="0" max="1" step="0.05" [value]="volume" (input)="onVolumeChange($event)" class="w-16 h-1 bg-white/30 accent-moyo-accent cursor-pointer" />
            </div>

            <!-- Horodatage -->
            <span class="font-mono text-[11px] text-moyo-muted">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </span>
          </div>

          <!-- Contrôles Droite : Qualité HLS, Plein écran -->
          <div class="flex items-center gap-4">
            <!-- Sélecteur de Qualité HLS -->
            <div class="relative" *ngIf="qualities.length > 0">
              <button (click)="isQualityMenuOpen = !isQualityMenuOpen" class="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 transition-colors">
                <span>{{ currentQualityLabel }}</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <div *ngIf="isQualityMenuOpen" class="absolute bottom-8 right-0 bg-moyo-card border border-moyo-border rounded-xl py-1 shadow-2xl z-20 min-w-[110px]">
                <button (click)="selectQuality(-1)" class="w-full text-left px-3 py-1.5 text-xs hover:bg-moyo-accent/20 hover:text-moyo-accent transition-colors flex items-center justify-between"
                        [ngClass]="selectedQualityIndex === -1 ? 'text-moyo-accent font-bold' : 'text-moyo-text'">
                  <span>Auto</span>
                  <span *ngIf="selectedQualityIndex === -1">✓</span>
                </button>
                <button *ngFor="let q of qualities" (click)="selectQuality(q.index)" class="w-full text-left px-3 py-1.5 text-xs hover:bg-moyo-accent/20 hover:text-moyo-accent transition-colors flex items-center justify-between"
                        [ngClass]="selectedQualityIndex === q.index ? 'text-moyo-accent font-bold' : 'text-moyo-text'">
                  <span>{{ q.label }}</span>
                  <span *ngIf="selectedQualityIndex === q.index">✓</span>
                </button>
              </div>
            </div>

            <!-- Plein écran -->
            <button (click)="toggleFullscreen()" class="hover:text-moyo-accent transition-colors" title="Plein écran">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('playerContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  @Input() srcUrl = '';
  @Input() posterUrl = '';
  @Output() progress = new EventEmitter<number>();
  @Output() completed = new EventEmitter<void>();

  private hls: Hls | null = null;
  isPlaying = false;
  isLoading = false;
  isMuted = false;
  volume = 1;
  currentTime = 0;
  duration = 0;
  progressPercent = 0;
  errorMessage = '';

  qualities: QualityLevel[] = [];
  selectedQualityIndex = -1; // -1 = Auto
  currentQualityLabel = 'Auto';
  isQualityMenuOpen = false;

  ngOnInit() {
    this.initPlayer();
  }

  ngOnDestroy() {
    this.destroyHls();
  }

  private initPlayer() {
    if (!this.srcUrl) return;

    const video = this.videoRef.nativeElement;

    if (Hls.isSupported() && this.srcUrl.includes('.m3u8')) {
      this.destroyHls();
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      this.hls.loadSource(this.srcUrl);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        this.qualities = data.levels.map((level, idx) => ({
          index: idx,
          height: level.height,
          label: `${level.height}p`,
          bitrate: level.bitrate,
        })).sort((a, b) => b.height - a.height);
      });

      this.hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (this.selectedQualityIndex === -1 && this.qualities[data.level]) {
          this.currentQualityLabel = `Auto (${this.qualities[data.level].label})`;
        }
      });

      this.hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              this.errorMessage = 'Erreur réseau lors du chargement du flux HLS.';
              this.hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              this.errorMessage = 'Erreur média lors du décodage.';
              this.hls?.recoverMediaError();
              break;
            default:
              this.errorMessage = 'Impossible de charger ce contenu multimédia.';
              this.destroyHls();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Support natif Safari HLS
      video.src = this.srcUrl;
    } else {
      // Fichier vidéo direct (MP4, WebM)
      video.src = this.srcUrl;
    }
  }

  private destroyHls() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  togglePlay() {
    const video = this.videoRef.nativeElement;
    if (video.paused) {
      video.play().then(() => {
        this.isPlaying = true;
      }).catch(() => {
        this.isPlaying = false;
      });
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }

  toggleMute() {
    const video = this.videoRef.nativeElement;
    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  onVolumeChange(event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    const video = this.videoRef.nativeElement;
    this.volume = val;
    video.volume = val;
    video.muted = val === 0;
    this.isMuted = video.muted;
  }

  seek(event: MouseEvent) {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    const video = this.videoRef.nativeElement;
    video.currentTime = pos * video.duration;
  }

  onTimeUpdate() {
    const video = this.videoRef.nativeElement;
    this.currentTime = video.currentTime;
    if (video.duration) {
      this.progressPercent = (video.currentTime / video.duration) * 100;
    }
    this.progress.emit(Math.floor(this.currentTime));
  }

  onLoadedMetadata() {
    const video = this.videoRef.nativeElement;
    this.duration = video.duration || 0;
  }

  onEnded() {
    this.isPlaying = false;
    this.completed.emit();
  }

  selectQuality(qualityIndex: number) {
    this.selectedQualityIndex = qualityIndex;
    this.isQualityMenuOpen = false;

    if (this.hls) {
      this.hls.currentLevel = qualityIndex; // -1 for auto
      if (qualityIndex === -1) {
        this.currentQualityLabel = 'Auto';
      } else {
        const found = this.qualities.find(q => q.index === qualityIndex);
        this.currentQualityLabel = found ? found.label : 'Auto';
      }
    }
  }

  toggleFullscreen() {
    const container = this.containerRef.nativeElement;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const mStr = mins < 10 ? `0${mins}` : `${mins}`;
    const sStr = secs < 10 ? `0${secs}` : `${secs}`;
    return `${mStr}:${sStr}`;
  }
}
