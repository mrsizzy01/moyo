import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto py-16 px-4">
      <div class="glass-panel rounded-2xl p-8 border border-moyo-border shadow-2xl space-y-6">
        <div class="text-center space-y-2">
          <h1 class="text-2xl font-bold text-white tracking-tight">Connexion à Moyo</h1>
          <p class="text-xs text-moyo-muted">Accédez à votre espace créateur et vos playlists</p>
        </div>

        <div *ngIf="errorMessage" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="handleLogin()" class="space-y-4">
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-white">Identifiant ou Email</label>
            <input type="text" [(ngModel)]="identifier" name="identifier" required placeholder="nom_utilisateur ou email"
                   class="w-full px-3.5 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white text-sm focus:outline-none focus:border-moyo-accent" />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-white">Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••"
                   class="w-full px-3.5 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white text-sm focus:outline-none focus:border-moyo-accent" />
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary w-full text-sm mt-2">
            {{ loading ? 'Vérification en cours...' : 'Se connecter' }}
          </button>
        </form>

        <div class="text-center text-xs text-moyo-muted pt-2 border-t border-moyo-border">
          Pas encore de compte ?
          <a routerLink="/auth/register" class="text-moyo-accent hover:underline font-semibold ml-1">Créer un compte</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  identifier = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private readonly apiService: ApiService, private readonly router: Router) {}

  handleLogin() {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.login({ identifier: this.identifier, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.data?.tokens?.accessToken) {
          localStorage.setItem('moyo_token', res.data.tokens.accessToken);
        }
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Identifiants invalides ou service indisponible';
      }
    });
  }
}
