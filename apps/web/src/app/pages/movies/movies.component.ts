import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      <!-- Hero Showcase -->
      <div class="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950 via-purple-950 to-moyo-dark border border-moyo-border p-8 sm:p-12 shadow-2xl">
        <div class="relative z-10 max-w-2xl space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 uppercase tracking-widest">
            Cinéma & Animation
          </div>
          <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Films Indépendants, Courts & Animations
          </h1>
          <p class="text-sm sm:text-base text-gray-300 leading-relaxed">
            Découvrez une sélection d'œuvres cinématographiques libres, documentaires engagés et créations animées 2D/3D propulsées par des créateurs indépendants du monde entier.
          </p>
        </div>
      </div>

      <!-- Filter Categories -->
      <div class="flex items-center gap-3 overflow-x-auto pb-2">
        <button *ngFor="let cat of categories"
                (click)="selectCategory(cat.id)"
                [ngClass]="selectedCategory === cat.id ? 'bg-moyo-accent text-white shadow-lg shadow-moyo-accent/20' : 'bg-moyo-card text-moyo-muted border border-moyo-border hover:text-white'"
                class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all">
          {{ cat.label }}
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-moyo-accent border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && movies.length === 0" class="text-center py-20 glass-panel rounded-2xl border border-moyo-border text-moyo-muted space-y-3">
        <div class="text-4xl">🎬</div>
        <p class="text-lg font-medium text-white">Aucun film ou animation dans cette catégorie.</p>
        <p class="text-xs text-moyo-muted">Soyez le premier à publier votre projet cinématographique sur Moyo.</p>
        <a routerLink="/studio" class="btn-primary inline-block text-xs mt-2">Publier un film</a>
      </div>

      <!-- Movies Grid -->
      <div *ngIf="!isLoading && movies.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div *ngFor="let movie of movies"
             [routerLink]="['/watch', movie.id]"
             class="group flex flex-col space-y-2.5 cursor-pointer">
          <div class="aspect-[16/9] rounded-2xl overflow-hidden bg-moyo-card border border-moyo-border relative group-hover:border-moyo-accent transition-all shadow-xl">
            <img *ngIf="movie.thumbnailUrl" [src]="movie.thumbnailUrl" [alt]="movie.title"
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div *ngIf="!movie.thumbnailUrl" class="w-full h-full flex items-center justify-center text-moyo-muted text-3xl">
              🎬
            </div>
            <span *ngIf="movie.durationSeconds" class="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold">
              {{ formatDuration(movie.durationSeconds) }}
            </span>
            <span class="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] px-2 py-0.5 rounded-md text-white font-medium uppercase tracking-wider">
              {{ movie.mediaType }}
            </span>
          </div>

          <div class="space-y-1">
            <h3 class="text-sm font-bold text-white group-hover:text-moyo-accent line-clamp-1 transition-colors">{{ movie.title }}</h3>
            <p *ngIf="movie.description" class="text-xs text-moyo-muted line-clamp-2">{{ movie.description }}</p>
            <div class="flex items-center justify-between text-[11px] text-moyo-muted pt-1">
              <span>{{ movie.creator?.channelName || movie.creator?.user?.displayName || 'Créateur indépendant' }}</span>
              <span>{{ movie.viewsCount || 0 }} vues</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MoviesPageComponent implements OnInit {
  movies: any[] = [];
  isLoading = true;
  selectedCategory = 'ALL';

  categories = [
    { id: 'ALL', label: '🍿 Tous les films & animations' },
    { id: 'FILM', label: '🎬 Longs-métrages' },
    { id: 'SHORT', label: '⏱️ Courts-métrages' },
    { id: 'DOCUMENTARY', label: '🌍 Documentaires' },
  ];

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.loadMovies();
  }

  selectCategory(id: string) {
    this.selectedCategory = id;
    this.loadMovies();
  }

  loadMovies() {
    this.isLoading = true;
    const mediaType = this.selectedCategory === 'ALL' ? undefined : this.selectedCategory;
    this.api.getVideos({ mediaType }).subscribe({
      next: (res) => {
        const items = res?.data?.items || res?.items || [];
        this.movies = items;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
