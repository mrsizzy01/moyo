import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from './services/auth.service';
import { NotificationsService, NotificationItem } from './services/notifications.service';
import { AudioPlayerComponent } from './components/player/audio-player.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, AudioPlayerComponent],
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
                placeholder="Rechercher des films, séries, musiques, créateurs..."
                class="w-full pl-10 pr-4 py-2 rounded-xl bg-moyo-card border border-moyo-border text-sm text-white placeholder-moyo-muted focus:outline-none focus:border-moyo-accent transition-colors" />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-moyo-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </form>

          <!-- Nav Links -->
          <div class="hidden md:flex items-center gap-1">
            <a routerLink="/movies" routerLinkActive="text-moyo-accent" class="nav-link">🎬 Films</a>
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

            <!-- Notifications Bell -->
            <div *ngIf="currentUser" class="relative">
              <button (click)="toggleNotifications()" class="relative p-2 rounded-xl hover:bg-white/5 text-moyo-muted hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span *ngIf="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-moyo-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
              </button>

              <!-- Notifications Popover -->
              <div *ngIf="showNotifications" class="absolute right-0 mt-2 w-80 rounded-2xl bg-moyo-dark border border-moyo-border shadow-2xl p-4 z-50 space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-moyo-border">
                  <span class="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                  <button (click)="markAllNotificationsRead()" class="text-[11px] text-moyo-accent hover:underline">Tout marquer comme lu</button>
                </div>
                <div *ngIf="notifications.length === 0" class="text-center py-6 text-xs text-moyo-muted">
                  Aucune nouvelle notification.
                </div>
                <div *ngIf="notifications.length > 0" class="max-h-64 overflow-y-auto space-y-2">
                  <div *ngFor="let n of notifications"
                       (click)="markNotificationRead(n)"
                       class="p-2.5 rounded-xl border text-xs cursor-pointer transition-colors"
                       [ngClass]="n.isRead ? 'bg-white/[0.02] border-transparent text-moyo-muted' : 'bg-moyo-accent/10 border-moyo-accent/20 text-white'">
                    <p class="font-semibold text-white">{{ n.title }}</p>
                    <p class="text-[11px] text-moyo-muted mt-0.5">{{ n.body }}</p>
                    <span class="text-[9px] text-moyo-muted block mt-1">{{ n.createdAt | date:'short' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Avatar / Login -->
            <a *ngIf="!currentUser" routerLink="/auth/login" class="btn-primary text-xs px-3 py-1.5">Connexion</a>

            <div *ngIf="currentUser" class="flex items-center gap-2">
              <a routerLink="/profile" class="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-moyo-accent to-pink-500 p-0.5">
                  <div class="w-full h-full bg-moyo-dark rounded-[6px] flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden">
                    <img *ngIf="currentUser.avatarUrl" [src]="currentUser.avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
                    <span *ngIf="!currentUser.avatarUrl">{{ currentUser.username.substring(0, 2) }}</span>
                  </div>
                </div>
                <span class="text-xs font-medium text-white hidden sm:block">{{ currentUser.displayName || currentUser.username }}</span>
              </a>
            </div>
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
          <a routerLink="/profile" routerLinkActive="text-moyo-accent" class="flex-1 flex flex-col items-center py-2 text-moyo-muted text-xs gap-0.5">
            <span>👤</span><span>Profil</span>
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

      <!-- Lecteur Audio Persistant Global -->
      <app-audio-player></app-audio-player>
    </div>
  `,
  styles: [`
    .nav-link {
      padding: 0.375rem 0.75rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      color: #94a3b8;
      transition: all 0.2s ease;
    }
    .nav-link:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.05);
    }
  `]
})
export class AppComponent implements OnInit {
  searchQuery = '';
  currentUser: User | null = null;
  unreadCount = 0;
  notifications: NotificationItem[] = [];
  showNotifications = false;

  constructor(
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly notifService: NotificationsService,
  ) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.notifService.loadNotifications().subscribe();
      }
    });

    this.notifService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });

    this.notifService.notifications$.subscribe((items) => {
      this.notifications = items;
    });
  }

  doSearch(e: Event) {
    e.preventDefault();
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.notifService.loadNotifications().subscribe();
    }
  }

  markNotificationRead(n: NotificationItem) {
    if (!n.isRead) {
      this.notifService.markAsRead(n.id).subscribe();
    }
  }

  markAllNotificationsRead() {
    this.notifService.markAllAsRead().subscribe();
  }
}
