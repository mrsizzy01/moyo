import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-white tracking-tight">📺 Séries</h1>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="glass-panel rounded-2xl overflow-hidden border border-moyo-border animate-pulse">
          <div class="w-full h-44 bg-white/5"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 bg-white/5 rounded-lg w-3/4"></div>
            <div class="h-3 bg-white/5 rounded-lg w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div *ngIf="!loading()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div *ngFor="let s of series()" class="glass-panel rounded-2xl overflow-hidden border border-moyo-border hover:border-moyo-accent/40 transition-all group cursor-pointer" [routerLink]="['/series', s.id]">
          <!-- Banner -->
          <div class="relative w-full h-44 bg-moyo-dark overflow-hidden">
            <img *ngIf="s.bannerUrl" [src]="s.bannerUrl" [alt]="s.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div *ngIf="!s.bannerUrl" class="w-full h-full flex items-center justify-center text-5xl">📺</div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div class="absolute bottom-2 left-3 text-xs font-semibold text-white">{{ s.seasons?.length || 0 }} saison(s)</div>
          </div>
          <!-- Info -->
          <div class="p-4 space-y-1">
            <h2 class="font-bold text-white text-sm truncate">{{ s.title }}</h2>
            <p class="text-xs text-moyo-muted">{{ s.creator?.channelName }}</p>
            <p *ngIf="s.description" class="text-xs text-moyo-muted line-clamp-2">{{ s.description }}</p>
          </div>
        </div>

        <!-- Empty -->
        <div *ngIf="!loading() && series().length === 0" class="col-span-full text-center py-16 glass-panel rounded-2xl border border-moyo-border">
          <p class="text-4xl mb-3">📺</p>
          <p class="text-white font-semibold">Aucune série disponible</p>
          <p class="text-sm text-moyo-muted mt-1">Les créateurs publieront bientôt du contenu.</p>
        </div>
      </div>
    </div>
  `
})
export class SeriesPageComponent implements OnInit {
  series = signal<any[]>([]);
  loading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('http://localhost:3000/api/series').subscribe({
      next: res => { this.series.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
