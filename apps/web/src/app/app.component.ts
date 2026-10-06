import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <div class="min-h-screen bg-moyo-dark text-white font-display flex flex-col">

      <!-- Top Navigation Bar -->
      <header class="sticky top-0 z-40 w-full border-b border-moyo-border bg-moyo-dark/90 backdrop-blur-xl">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 shrink-0 group">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-moyo-accent to-orange-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-moyo-accent/30 group-hover:shadow-moyo-accent/50 transition-shadow">M</div>
            <span class="font-black text-white text-lg tracking-tight hidden sm:block">moyo</span>
          </a>

          <!-- Search Bar (center) -->
          <form (submit)="doSearch($event)" class="flex-1 max-w-lg mx-auto hidden md:block">
            <div class="relative">
              <input type="text" [(ngModel)]="searchQuery" name="q"
                placeholder="Rechercher..."
                class="w-full pl-10 pr-4 py-2 rounded-xl bg-moyo-card border border-moyo-border text-sm text-white placeholder-moyo-muted focus:outline-none focus:border-moyo-accent transition-colors" />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-moyo-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </form>

          <!-- Nav Links -->
          <div class="hidden md:flex items-center gap-1">
            <a routerLink="/series" routerLinkActive="text-moyo-accent" class="nav-link">📺 Séries</a>
            <a routerLink="/music" routerLinkActive="text-moyo-accent" class="nav-link">🎵 Musique</a>
            <a routerLink="/podcasts" routerLinkActive="text-moyo-accent" class="nav-link">🎙️ Podcasts</a>
            <a routerLink="/live" routerLinkActive="text-moyo-accent" class="nav-link flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>Live
            </a>
          </div>

          <!-- Right Actions -->
          <div class="ml-auto flex items-center gap-2 shrink-0">
            <a routerLink="/studio" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-moyo-border text-xs font-semibold hover:border-moyo-accent/40 transition-colors text-moyo-muted hover:text-white">
              ✏️ Studio
            </a>
            <a routerLink="/auth/login" class="btn-primary text-xs px-3 py-1.5">Connexion</a>
          </div>
        </nav>

        <!-- Mobile nav bottom bar -->
        <div class="md:hidden flex border-t border-moyo-border">
          <a routerLink="/" routerLinkActive="text-moyo-accent" [routerLinkActiveOptions]="{exact:true}" class="flex-1 flex flex-col items-center py-2 text-moyo-muted text-xs gap-0.5">
            <span>🏠</span><span>Accueil</span>
          </a>
          <a routerLink="/series" routerLinkActive="text-moyo-accent" class="flex-1 flex flex-col items-center py-2 text-moyo-muted text-xs gap-0.5">
            <span>📺</span><span>Séries</span>
          </a>
          <a routerLink="/music" routerLinkActive="text-moyo-accent" class="flex-1 flex flex-col items-center py-2 text-moyo-muted text-xs gap-0.5">
            <span>🎵</span><span>Musique</span>
          </a>
          <a routerLink="/live" routerLinkActive="text-moyo-accent" class="flex-1 flex flex-col items-center py-2 text-moyo-muted text-xs gap-0.5">
            <span>🔴</span><span>Live</span>
          </a>
          <a routerLink="/search" routerLinkActive="text-moyo-accent" class="flex-1 flex flex-col items-center py-2 text-moyo-muted text-xs gap-0.5">
            <span>🔍</span><span>Chercher</span>
          </a>
        </div>
      </header>

      <!-- Main -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="border-t border-moyo-border py-6 px-4 mt-auto">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-moyo-muted">
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-md bg-gradient-to-br from-moyo-accent to-orange-600 flex items-center justify-center text-white text-xs font-black">M</div>
            <span>Moyo — Regarder. Écouter. Créer. Diffuser.</span>
          </div>
          <div class="flex items-center gap-4">
            <a href="https://github.com/mrsizzy01/moyo" target="_blank" class="hover:text-white transition-colors">GitHub</a>
            <a routerLink="/status" class="hover:text-white transition-colors">Statut</a>
            <span>AGPL-3.0 © 2026 Moyo</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .nav-link {
      @apply px-3 py-1.5 rounded-xl text-sm text-moyo-muted hover:text-white hover:bg-white/5 transition-all;
    }
  `]
})
export class AppComponent {
  searchQuery = '';

  constructor(private router: Router) {}

  doSearch(e: Event) {
    e.preventDefault();
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
    }
  }
}
