import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AudioTrackInfo {
  id: string;
  title: string;
  artistName: string;
  coverUrl?: string;
  audioUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService {
  private audioElement: HTMLAudioElement = new Audio();

  private currentTrackSubject = new BehaviorSubject<AudioTrackInfo | null>(null);
  public currentTrack$ = this.currentTrackSubject.asObservable();

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  public isPlaying$ = this.isPlayingSubject.asObservable();

  private currentTimeSubject = new BehaviorSubject<number>(0);
  public currentTime$ = this.currentTimeSubject.asObservable();

  private durationSubject = new BehaviorSubject<number>(0);
  public duration$ = this.durationSubject.asObservable();

  private volumeSubject = new BehaviorSubject<number>(1);
  public volume$ = this.volumeSubject.asObservable();

  constructor() {
    this.setupAudioListeners();
  }

  private setupAudioListeners() {
    this.audioElement.addEventListener('timeupdate', () => {
      this.currentTimeSubject.next(this.audioElement.currentTime);
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      this.durationSubject.next(this.audioElement.duration || 0);
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlayingSubject.next(false);
    });

    this.audioElement.addEventListener('play', () => {
      this.isPlayingSubject.next(true);
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlayingSubject.next(false);
    });
  }

  playTrack(track: AudioTrackInfo) {
    if (this.currentTrackSubject.value?.id === track.id) {
      if (this.audioElement.paused) {
        this.audioElement.play();
      }
      return;
    }

    this.currentTrackSubject.next(track);
    this.audioElement.src = track.audioUrl;
    this.audioElement.load();
    this.audioElement.play().catch((err) => {
      console.warn('Autoplay bloqué par le navigateur :', err);
    });
  }

  togglePlay() {
    if (!this.currentTrackSubject.value) return;

    if (this.audioElement.paused) {
      this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
  }

  seek(seconds: number) {
    if (!isNaN(seconds)) {
      this.audioElement.currentTime = seconds;
    }
  }

  setVolume(vol: number) {
    this.audioElement.volume = Math.max(0, Math.min(1, vol));
    this.volumeSubject.next(this.audioElement.volume);
  }

  close() {
    this.audioElement.pause();
    this.audioElement.src = '';
    this.currentTrackSubject.next(null);
    this.isPlayingSubject.next(false);
  }
}
