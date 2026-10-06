import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-12 pb-16">
      <!-- Hero Section -->
      <section class="relative overflow-hidden rounded-3xl p-8 md:p-14 glass-panel border border-moyo-border mt-4">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-moyo-accent/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 w-96 h-96 bg-moyo-violet/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-2xl space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-moyo-accent uppercase">
            <span class="w-2 h-2 rounded-full bg-moyo-accent animate-pulse"></span>
            Plateforme Multimédia Open Source
          </div>

          <h1 class="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Regarder. Écouter. <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-moyo-accent via-orange-400 to-amber-300">
              Créer. Diffuser.
            </span>
          </h1>

          <p class="text-lg text-moyo-muted leading-relaxed">
            Moyo rassemble films, séries, animations, musique, podcasts et diffusions en direct sur une infrastructure souveraine et auto-hébergeable.
          </p>

          <div class="flex flex-wrap gap-4 pt-2">
            <a routerLink="/studio" class="btn-primary flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Espace Créateur
            </a>
            <a routerLink="/live" class="btn-secondary flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Explorer les Lives
            </a>
            <a routerLink="/status" class="btn-secondary text-sm flex items-center gap-1.5">
              État de l'instance
            </a>
          </div>
        </div>
      </section>

      <!-- Category Filter Tabs -->
      <section class="space-y-6">
        <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button *ngFor="let cat of categories"
                  (click)="activeCategory = cat.id"
                  [ngClass]="activeCategory === cat.id ? 'bg-moyo-accent text-white font-semibold shadow-lg shadow-moyo-accent/25' : 'bg-moyo-card text-moyo-muted hover:text-white border border-moyo-border'"
                  class="px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all duration-200">
            {{ cat.label }}
          </button>
        </div>

        <!-- Real Empty State (Zero Fake Data Guarantee) -->
        <div class="glass-panel rounded-2xl p-12 text-center border border-moyo-border space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-moyo-muted">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-white">Catalogue initial vierge</h2>
          <p class="text-sm text-moyo-muted max-w-md mx-auto">
            Aucun contenu n'a encore été publié dans la catégorie <strong class="text-white">{{ getCategoryLabel(activeCategory) }}</strong>. Connectez-vous et publiez vos premiers médias via le Studio.
          </p>
          <div class="pt-2">
            <a routerLink="/studio" class="btn-primary inline-flex items-center gap-2 text-sm">
              Publier un contenu dans cette catégorie
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent {
  activeCategory = 'all';

  categories = [
    { id: 'all', label: 'Tout explorer' },
    { id: 'movies', label: '🎬 Films' },
    { id: 'series', label: '📺 Séries & Saisons' },
    { id: 'animation', label: '🎨 Animations' },
    { id: 'music', label: '🎵 Musique' },
    { id: 'podcasts', label: '🎙️ Podcasts' },
    { id: 'live', label: '🔴 Directs' },
  ];

  getCategoryLabel(id: string): string {
    return this.categories.find(c => c.id === id)?.label || 'Sélection';
  }
}
