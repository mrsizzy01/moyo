import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <!-- En-tête Recherche -->
      <div class="space-y-4">
        <h1 class="text-3xl font-bold text-white tracking-tight">Recherche globale</h1>
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="query"
            (ngModelChange)="onQueryChange($event)"
            placeholder="Chercher une vidéo, un artiste, une série, un podcast..."
            class="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-moyo-card border border-moyo-border text-white placeholder-moyo-muted focus:outline-none focus:border-moyo-accent text-sm transition-colors"
          />
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-moyo-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- État vide initial -->
      <div *ngIf="!query" class="glass-panel rounded-2xl p-12 text-center border border-moyo-border">
        <div class="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto text-moyo-muted mb-4">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <p class="text-white font-semibold">Tapez pour lancer la recherche</p>
        <p class="text-sm text-moyo-muted mt-1">Recherche dans les vidéos, artistes, séries, podcasts et créateurs</p>
      </div>

      <!-- Chargement -->
      <div *ngIf="loading && query" class="flex items-center justify-center py-12 gap-3">
        <div class="w-6 h-6 border-3 border-moyo-accent/30 border-t-moyo-accent rounded-full animate-spin"></div>
        <span class="text-sm text-moyo-muted">Recherche en cours...</span>
      </div>

      <!-- Résultats -->
      <div *ngIf="results && !loading" class="space-y-8">
        <p class="text-sm text-moyo-muted">{{ results.totalResults }} résultat(s) pour « {{ query }} »</p>

        <!-- Vidéos & Films -->
        <section *ngIf="results.videos.length > 0" class="space-y-3">
          <h2 class="text-base font-bold text-white flex items-center gap-2">🎬 Vidéos & Films <span class="text-xs text-moyo-muted font-normal">({{ results.videos.length }})</span></h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div *ngFor="let v of results.videos" class="glass-panel rounded-xl p-4 flex items-start gap-3 border border-moyo-border hover:border-moyo-accent/30 transition-colors cursor-pointer group">
              <div class="w-24 h-14 rounded-lg bg-moyo-dark flex-shrink-0 overflow-hidden border border-moyo-border">
                <img *ngIf="v.thumbnailUrl" [src]="v.thumbnailUrl" [alt]="v.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div *ngIf="!v.thumbnailUrl" class="w-full h-full flex items-center justify-center text-moyo-muted">🎬</div>
              </div>
              <div class="flex-1 truncate">
                <div class="text-sm font-semibold text-white truncate">{{ v.title }}</div>
                <div class="text-xs text-moyo-muted mt-0.5">{{ v.creator?.channelName }}</div>
                <div class="text-xs text-moyo-muted">{{ v.mediaType }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Séries -->
        <section *ngIf="results.series.length > 0" class="space-y-3">
          <h2 class="text-base font-bold text-white flex items-center gap-2">📺 Séries <span class="text-xs text-moyo-muted font-normal">({{ results.series.length }})</span></h2>
          <div class="flex flex-wrap gap-3">
            <div *ngFor="let s of results.series" class="glass-panel rounded-xl p-3.5 border border-moyo-border hover:border-moyo-accent/30 transition-colors cursor-pointer min-w-[180px] flex-1">
              <div class="text-sm font-semibold text-white">{{ s.title }}</div>
              <div class="text-xs text-moyo-muted">{{ s.creator?.channelName }}</div>
            </div>
          </div>
        </section>

        <!-- Artistes -->
        <section *ngIf="results.artists.length > 0" class="space-y-3">
          <h2 class="text-base font-bold text-white flex items-center gap-2">🎵 Artistes <span class="text-xs text-moyo-muted font-normal">({{ results.artists.length }})</span></h2>
          <div class="flex flex-wrap gap-3">
            <div *ngFor="let a of results.artists" class="glass-panel rounded-xl p-3.5 border border-moyo-border hover:border-moyo-accent/30 transition-colors cursor-pointer flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-moyo-dark border border-moyo-border flex-shrink-0 overflow-hidden flex items-center justify-center text-moyo-muted">
                <img *ngIf="a.avatarUrl" [src]="a.avatarUrl" [alt]="a.name" class="w-full h-full object-cover rounded-full" />
                <span *ngIf="!a.avatarUrl">🎤</span>
              </div>
              <div>
                <div class="text-sm font-semibold text-white">{{ a.name }}</div>
                <div class="text-xs text-moyo-muted">{{ a._count?.albums || 0 }} album(s)</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Podcasts -->
        <section *ngIf="results.podcasts.length > 0" class="space-y-3">
          <h2 class="text-base font-bold text-white flex items-center gap-2">🎙️ Podcasts <span class="text-xs text-moyo-muted font-normal">({{ results.podcasts.length }})</span></h2>
          <div class="flex flex-wrap gap-3">
            <div *ngFor="let p of results.podcasts" class="glass-panel rounded-xl p-3.5 border border-moyo-border hover:border-moyo-accent/30 transition-colors cursor-pointer">
              <div class="text-sm font-semibold text-white">{{ p.title }}</div>
              <div class="text-xs text-moyo-muted">{{ p._count?.episodes || 0 }} épisode(s)</div>
            </div>
          </div>
        </section>

        <!-- Créateurs -->
        <section *ngIf="results.creators.length > 0" class="space-y-3">
          <h2 class="text-base font-bold text-white flex items-center gap-2">👤 Créateurs <span class="text-xs text-moyo-muted font-normal">({{ results.creators.length }})</span></h2>
          <div class="flex flex-wrap gap-3">
            <div *ngFor="let c of results.creators" class="glass-panel rounded-xl p-3.5 border border-moyo-border hover:border-moyo-accent/30 transition-colors cursor-pointer flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-moyo-card border border-moyo-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img *ngIf="c.avatarUrl" [src]="c.avatarUrl" [alt]="c.channelName" class="w-full h-full object-cover rounded-full" />
                <span *ngIf="!c.avatarUrl" class="text-moyo-muted text-lg">👤</span>
              </div>
              <div>
                <div class="text-sm font-semibold text-white flex items-center gap-1">
                  {{ c.channelName }}
                  <svg *ngIf="c.isVerified" class="w-3.5 h-3.5 text-moyo-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div class="text-xs text-moyo-muted">{{ c.subscribersCount }} abonné(s)</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Aucun résultat -->
        <div *ngIf="results.totalResults === 0" class="glass-panel rounded-2xl p-10 text-center border border-moyo-border">
          <p class="text-white font-semibold">Aucun résultat trouvé</p>
          <p class="text-sm text-moyo-muted mt-1">Essayez un terme différent ou publiez du contenu via votre Studio.</p>
        </div>
      </div>
    </div>
  `
})
export class SearchPageComponent {
  query = '';
  results: any = null;
  loading = false;

  private search$ = new Subject<string>();

  constructor(private readonly http: HttpClient) {
    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.length < 2) {
          this.results = null;
          this.loading = false;
          return [];
        }
        this.loading = true;
        return this.http.get<any>(`http://localhost:3000/api/search?q=${encodeURIComponent(q)}`);
      })
    ).subscribe({
      next: (res) => {
        this.results = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onQueryChange(q: string) {
    this.search$.next(q);
  }
}
