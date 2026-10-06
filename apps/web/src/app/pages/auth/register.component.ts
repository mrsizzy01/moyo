import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto py-12 px-4">
      <div class="glass-panel rounded-2xl p-8 border border-moyo-border shadow-2xl space-y-6">
        <div class="text-center space-y-2">
          <h1 class="text-2xl font-bold text-white tracking-tight">Rejoindre Moyo</h1>
          <p class="text-xs text-moyo-muted">Créez votre profil pour regarder, écouter et publier</p>
        </div>

        <div *ngIf="errorMessage" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="handleRegister()" class="space-y-4">
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-white">Adresse e-mail</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="nom@exemple.com"
                   class="w-full px-3.5 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white text-sm focus:outline-none focus:border-moyo-accent" />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-white">Nom d'utilisateur (identifiant unique)</label>
            <input type="text" [(ngModel)]="username" name="username" required placeholder="moyo_user"
                   class="w-full px-3.5 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white text-sm focus:outline-none focus:border-moyo-accent" />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-white">Nom affiché</label>
            <input type="text" [(ngModel)]="displayName" name="displayName" required placeholder="Prénom Nom"
                   class="w-full px-3.5 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white text-sm focus:outline-none focus:border-moyo-accent" />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-white">Mot de passe (8 caractères min.)</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="8" placeholder="••••••••"
                   class="w-full px-3.5 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white text-sm focus:outline-none focus:border-moyo-accent" />
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary w-full text-sm mt-2">
            {{ loading ? 'Création en cours...' : 'Créer mon compte' }}
          </button>
        </form>

        <div class="text-center text-xs text-moyo-muted pt-2 border-t border-moyo-border">
          Vous avez déjà un compte ?
          <a routerLink="/auth/login" class="text-moyo-accent hover:underline font-semibold ml-1">Se connecter</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  email = '';
  username = '';
  displayName = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private readonly apiService: ApiService, private readonly router: Router) {}

  handleRegister() {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.register({
      email: this.email,
      username: this.username,
      displayName: this.displayName,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.data?.tokens?.accessToken) {
          localStorage.setItem('moyo_token', res.data.tokens.accessToken);
        }
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création du compte';
      }
    });
  }
}
