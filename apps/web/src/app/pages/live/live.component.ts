import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-moyo-border">
        <div>
          <h1 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse"></span>
            Diffusions en Direct (Live RTMP / HLS)
          </h1>
          <p class="text-sm text-moyo-muted mt-1">
            Diffusion faible latence avec ingestion RTMP via Nginx et transcodage HLS en temps réel.
          </p>
        </div>
        <div>
          <button (click)="openStreamModal()" class="btn-primary flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Lancer un direct
          </button>
        </div>
      </div>

      <!-- Live Stream Player + Chat View -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Stage -->
        <div class="lg:col-span-2 space-y-4">
          <div class="aspect-video rounded-2xl bg-moyo-card border border-moyo-border flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-3">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-white">Aucun flux en direct actif</h3>
            <p class="text-sm text-moyo-muted max-w-sm mt-1">
              Les flux vidéo diffusés par OBS ou caméra s'affichent automatiquement ici dès la détection du flux RTMP.
            </p>
          </div>

          <!-- Configuration Ingestion RTMP pour Créateurs -->
          <div class="p-5 rounded-2xl bg-moyo-dark/80 border border-moyo-border space-y-3">
            <h4 class="text-xs uppercase font-bold tracking-wider text-moyo-muted">Paramètres d'ingestion OBS / Studio</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-moyo-card border border-moyo-border">
                <span class="text-moyo-muted block mb-1">Serveur RTMP :</span>
                <code class="text-moyo-accent font-mono select-all">rtmp://localhost:1935/live</code>
              </div>
              <div class="p-3 rounded-xl bg-moyo-card border border-moyo-border">
                <span class="text-moyo-muted block mb-1">Format de sortie :</span>
                <code class="text-emerald-400 font-mono">HLS Adaptatif (.m3u8)</code>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Live Sidebar (Temps Réel WebSocket) -->
        <div class="glass-panel rounded-2xl border border-moyo-border flex flex-col h-[520px]">
          <div class="p-4 border-b border-moyo-border flex items-center justify-between">
            <span class="text-sm font-bold text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              Chat en Direct
            </span>
            <span class="text-xs text-moyo-muted">Socket.IO</span>
          </div>

          <!-- Message list -->
          <div class="flex-1 p-4 overflow-y-auto space-y-3">
            <div class="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-moyo-muted text-center">
              Rejoignez le salon de discussion lorsque le direct commence.
            </div>
          </div>

          <!-- Input -->
          <div class="p-3 border-t border-moyo-border">
            <div class="flex gap-2">
              <input type="text" placeholder="Envoyer un message au créateur..."
                     class="flex-1 px-3 py-2 rounded-xl bg-moyo-dark border border-moyo-border text-white text-xs placeholder-moyo-muted focus:outline-none focus:border-moyo-accent" />
              <button class="btn-primary text-xs px-3">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LiveComponent {
  openStreamModal() {
    alert("Pour diffuser : configurez votre logiciel OBS avec le serveur rtmp://localhost:1935/live et votre clé de stream personnelle fournie par votre profil créateur.");
  }
}
