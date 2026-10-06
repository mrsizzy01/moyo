import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, HealthResponse } from '../../services/api.service';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div class="glass-panel rounded-2xl p-8 border border-moyo-border shadow-2xl">
        <div class="flex items-center justify-between pb-6 border-b border-moyo-border">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <span class="inline-block w-3 h-3 rounded-full" [ngClass]="loading ? 'bg-yellow-400 animate-ping' : (error ? 'bg-red-500' : 'bg-emerald-500')"></span>
              État des Services de l'Instance
            </h1>
            <p class="text-sm text-moyo-muted mt-1">
              Surveillance en temps réel des composants système Moyo (PostgreSQL, Redis, MinIO, API).
            </p>
          </div>
          <button (click)="refresh()" [disabled]="loading" class="btn-secondary text-sm">
            {{ loading ? 'Actualisation...' : 'Actualiser' }}
          </button>
        </div>

        <div *ngIf="error" class="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <strong>Erreur de communication :</strong> L'API NestJS n'est pas encore joignable à l'adresse <code>http://localhost:3000/api</code>.
          Vérifiez que le serveur API est lancé via <code>npm run dev:api</code> ou via Docker.
        </div>

        <div *ngIf="health" class="mt-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- API -->
            <div class="p-5 rounded-xl bg-moyo-dark/60 border border-moyo-border">
              <div class="text-xs uppercase tracking-wider text-moyo-muted font-semibold">Service API NestJS</div>
              <div class="mt-2 text-lg font-bold text-white flex items-center justify-between">
                <span>Passerelle REST / WS</span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {{ health.services.api }}
                </span>
              </div>
            </div>

            <!-- PostgreSQL -->
            <div class="p-5 rounded-xl bg-moyo-dark/60 border border-moyo-border">
              <div class="text-xs uppercase tracking-wider text-moyo-muted font-semibold">Base de Données PostgreSQL</div>
              <div class="mt-2 text-lg font-bold text-white flex items-center justify-between">
                <span>Prisma ORM</span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                      [ngClass]="health.services.database === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'">
                  {{ health.services.database }}
                </span>
              </div>
            </div>

            <!-- Redis -->
            <div class="p-5 rounded-xl bg-moyo-dark/60 border border-moyo-border">
              <div class="text-xs uppercase tracking-wider text-moyo-muted font-semibold">Cache & Files BullMQ</div>
              <div class="mt-2 text-lg font-bold text-white flex items-center justify-between">
                <span>Redis Engine</span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {{ health.services.redis }}
                </span>
              </div>
            </div>

            <!-- MinIO -->
            <div class="p-5 rounded-xl bg-moyo-dark/60 border border-moyo-border">
              <div class="text-xs uppercase tracking-wider text-moyo-muted font-semibold">Stockage Objets (S3)</div>
              <div class="mt-2 text-lg font-bold text-white flex items-center justify-between">
                <span>MinIO Cluster</span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {{ health.services.minio }}
                </span>
              </div>
            </div>
          </div>

          <div class="pt-4 text-xs text-moyo-muted flex items-center justify-between">
            <span>Dernière vérification : {{ health.timestamp | date:'medium' }}</span>
            <span>Version de la plateforme : {{ health.version }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatusComponent implements OnInit {
  health: HealthResponse | null = null;
  loading = false;
  error = false;

  constructor(private readonly apiService: ApiService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.error = false;
    this.apiService.getHealth().subscribe({
      next: (res) => {
        this.health = res;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
}
