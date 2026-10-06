import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div class="glass-panel rounded-2xl p-8 border border-moyo-border shadow-2xl space-y-8">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-moyo-accent/10 border border-moyo-accent/20 text-xs font-semibold text-moyo-accent uppercase tracking-wider mb-2">
            Moyo Creator Studio
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Publier un nouveau contenu</h1>
          <p class="text-sm text-moyo-muted mt-1">
            Transférez votre fichier vidéo ou audio. Il sera analysé par FFprobe et encodé en flux adaptatif HLS multi-résolutions par notre worker FFmpeg.
          </p>
        </div>

        <form (ngSubmit)="submitUpload()" class="space-y-6">
          <!-- Type de contenu -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-white">Type de contenu multimédia</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <button type="button" *ngFor="let type of mediaTypes"
                      (click)="selectedType = type.id"
                      [ngClass]="selectedType === type.id ? 'bg-moyo-accent text-white border-moyo-accent' : 'bg-moyo-dark/70 text-moyo-muted border-moyo-border hover:border-white/20'"
                      class="p-3 rounded-xl border text-center transition-all text-sm font-medium">
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Zone de glisser-déposer de fichier -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-white">Fichier source original</label>
            <div class="border-2 border-dashed border-moyo-border rounded-2xl p-8 text-center hover:border-moyo-accent/50 transition-colors bg-moyo-dark/40 cursor-pointer">
              <div class="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-moyo-accent mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              <p class="text-sm font-medium text-white">Sélectionnez ou déposez votre fichier vidéo (MP4, MKV, MOV) ou audio (MP3, FLAC, WAV)</p>
              <p class="text-xs text-moyo-muted mt-1">Stocké dans le bucket MinIO/S3 dédié aux originaux</p>
            </div>
          </div>

          <!-- Titre & Description -->
          <div class="grid grid-cols-1 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-white">Titre du contenu</label>
              <input type="text" [(ngModel)]="title" name="title" placeholder="ex: Mon Premier Court-Métrage ou Album..."
                     class="w-full px-4 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white placeholder-moyo-muted focus:outline-none focus:border-moyo-accent text-sm" required />
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-white">Description & Synopsis</label>
              <textarea [(ngModel)]="description" name="description" rows="3" placeholder="Présentation du contenu, distribution, réalisateur, notes..."
                        class="w-full px-4 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white placeholder-moyo-muted focus:outline-none focus:border-moyo-accent text-sm"></textarea>
            </div>
          </div>

          <!-- Licence & Droits (Exigence Règle 22) -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-white">Licence de diffusion</label>
            <select [(ngModel)]="license" name="license"
                    class="w-full px-4 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white focus:outline-none focus:border-moyo-accent text-sm">
              <option value="ALL_RIGHTS_RESERVED">Tous droits réservés (Copyright standard)</option>
              <option value="CC_BY">Creative Commons Attribution (CC BY 4.0)</option>
              <option value="CC_BY_SA">Creative Commons Attribution - Partage dans les Mêmes Conditions (CC BY-SA 4.0)</option>
              <option value="CC_BY_NC">Creative Commons Attribution - Pas d’Utilisation Commerciale (CC BY-NC 4.0)</option>
              <option value="PUBLIC_DOMAIN">Domaine Public / Licence Ouverte</option>
            </select>
          </div>

          <!-- Confirmation obligatoire des droits légaux -->
          <div class="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" [(ngModel)]="rightsConfirmed" name="rightsConfirmed" class="mt-1 rounded bg-moyo-dark border-moyo-border text-moyo-accent focus:ring-0" required />
              <span class="text-xs text-moyo-muted leading-relaxed">
                Je certifie sur l'honneur être l'auteur ou disposer de l'intégralité des droits d'exploitation et de diffusion sur ce contenu numérique conformément aux conditions générales d'utilisation de Moyo.
              </span>
            </label>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-moyo-border">
            <button type="submit" [disabled]="!rightsConfirmed || !title"
                    [ngClass]="(!rightsConfirmed || !title) ? 'opacity-50 cursor-not-allowed' : ''"
                    class="btn-primary flex items-center gap-2">
              Démarrer le téléversement & transcodage
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class StudioComponent {
  selectedType = 'MOVIE';
  title = '';
  description = '';
  license = 'ALL_RIGHTS_RESERVED';
  rightsConfirmed = false;

  mediaTypes = [
    { id: 'MOVIE', label: '🎬 Film' },
    { id: 'SERIES_EPISODE', label: '📺 Épisode Série' },
    { id: 'ANIMATION', label: '🎨 Animation' },
    { id: 'MUSIC_TRACK', label: '🎵 Musique' },
    { id: 'PODCAST_EPISODE', label: '🎙️ Podcast' },
  ];

  submitUpload() {
    alert(`Téléversement de "${this.title}" initié. Le fichier sera traité via BullMQ et encodé en variantes adaptatives HLS.`);
  }
}
