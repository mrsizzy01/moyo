import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

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
            Transférez votre vidéo ou audio. Il sera analysé par FFprobe et encodé en variantes adaptatives HLS (1080p, 720p, 480p, 360p) par notre worker FFmpeg.
          </p>
        </div>

        <!-- Alert messages -->
        <div *ngIf="errorMessage" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {{ errorMessage }}
        </div>
        <div *ngIf="successMessage" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {{ successMessage }}
        </div>

        <form (ngSubmit)="submitUpload()" class="space-y-6">
          <!-- Type de contenu -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-white">Type de contenu multimédia</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <button type="button" *ngFor="let type of mediaTypes"
                      (click)="selectedType = type.id"
                      [ngClass]="selectedType === type.id ? 'bg-moyo-accent text-white border-moyo-accent shadow-lg shadow-moyo-accent/20' : 'bg-moyo-dark/70 text-moyo-muted border-moyo-border hover:border-white/20'"
                      class="p-3 rounded-xl border text-center transition-all text-sm font-medium">
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Zone de glisser-déposer de fichier vidéo -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-white">Fichier multimédia source *</label>
            <div (click)="fileInput.click()"
                 class="border-2 border-dashed border-moyo-border hover:border-moyo-accent/50 rounded-2xl p-8 text-center transition-colors bg-moyo-dark/40 cursor-pointer">
              <input #fileInput type="file" (change)="onFileSelected($event)" accept="video/*,audio/*" class="hidden" />
              <div class="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-moyo-accent mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              <p *ngIf="!selectedFile" class="text-sm font-medium text-white">
                Cliquez pour choisir ou déposez votre fichier vidéo ou audio
              </p>
              <p *ngIf="selectedFile" class="text-sm font-semibold text-moyo-accent">
                Fichier sélectionné : {{ selectedFile.name }} ({{ formatBytes(selectedFile.size) }})
              </p>
              <p class="text-xs text-moyo-muted mt-1">MP4, MKV, MOV, WebM, MP3, FLAC, WAV (jusqu'à 20 Go)</p>
            </div>
          </div>

          <!-- Miniature optionnelle -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-white">Miniature personnalisée (Optionnelle)</label>
            <div (click)="thumbInput.click()"
                 class="border border-dashed border-moyo-border hover:border-white/20 rounded-xl p-4 text-center cursor-pointer bg-moyo-dark/20">
              <input #thumbInput type="file" (change)="onThumbnailSelected($event)" accept="image/jpeg,image/png,image/webp" class="hidden" />
              <p *ngIf="!selectedThumbnail" class="text-xs text-moyo-muted">
                Sélectionnez une image (JPEG, PNG, WebP — max 10 Mo) ou laissez vide pour générer automatiquement à t+2s
              </p>
              <p *ngIf="selectedThumbnail" class="text-xs font-semibold text-moyo-accent">
                Miniature : {{ selectedThumbnail.name }}
              </p>
            </div>
          </div>

          <!-- Titre & Description -->
          <div class="grid grid-cols-1 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-white">Titre du contenu *</label>
              <input type="text" [(ngModel)]="title" name="title" placeholder="ex: Mon Premier Court-Métrage ou Album..."
                     class="w-full px-4 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white placeholder-moyo-muted focus:outline-none focus:border-moyo-accent text-sm" required />
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-white">Description & Synopsis</label>
              <textarea [(ngModel)]="description" name="description" rows="3" placeholder="Présentation du contenu, distribution, notes de production..."
                        class="w-full px-4 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white placeholder-moyo-muted focus:outline-none focus:border-moyo-accent text-sm"></textarea>
            </div>
          </div>

          <!-- Tags & Langue -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-white">Tags (séparés par des virgules)</label>
              <input type="text" [(ngModel)]="tagsInput" name="tags" placeholder="cinema, afrique, musique, docu"
                     class="w-full px-4 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white placeholder-moyo-muted focus:outline-none focus:border-moyo-accent text-sm" />
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-white">Classification d'âge</label>
              <select [(ngModel)]="ageRating" name="ageRating"
                      class="w-full px-4 py-2.5 rounded-xl bg-moyo-dark border border-moyo-border text-white focus:outline-none focus:border-moyo-accent text-sm">
                <option value="ALL">Tout public</option>
                <option value="12+">12 ans et plus</option>
                <option value="16+">16 ans et plus</option>
                <option value="18+">18 ans et plus</option>
              </select>
            </div>
          </div>

          <!-- Barre de progression de l'upload -->
          <div *ngIf="isUploading" class="space-y-2 p-4 rounded-xl bg-moyo-dark border border-moyo-accent/30">
            <div class="flex justify-between text-xs font-medium">
              <span class="text-white">{{ uploadStep }}</span>
              <span class="text-moyo-accent font-mono">{{ uploadProgress }}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div class="h-full bg-moyo-accent transition-all duration-300 rounded-full" [style.width.%]="uploadProgress"></div>
            </div>
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
            <button type="submit" [disabled]="!rightsConfirmed || !title || !selectedFile || isUploading"
                    [ngClass]="(!rightsConfirmed || !title || !selectedFile || isUploading) ? 'opacity-50 cursor-not-allowed' : ''"
                    class="btn-primary flex items-center gap-2">
              <span *ngIf="isUploading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isUploading ? 'Téléversement en cours...' : 'Publier et lancer le transcodage' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class StudioComponent {
  selectedType = 'VIDEO';
  title = '';
  description = '';
  tagsInput = '';
  ageRating = 'ALL';
  rightsConfirmed = false;

  selectedFile: File | null = null;
  selectedThumbnail: File | null = null;

  isUploading = false;
  uploadProgress = 0;
  uploadStep = '';
  errorMessage = '';
  successMessage = '';

  mediaTypes = [
    { id: 'VIDEO', label: '🎬 Vidéo' },
    { id: 'FILM', label: '🎥 Film' },
    { id: 'SERIES_EPISODE', label: '📺 Épisode Série' },
    { id: 'DOCUMENTARY', label: '🌍 Documentaire' },
    { id: 'MUSIC_VIDEO', label: '🎵 Clip Musical' },
    { id: 'AUDIO', label: '🎧 Audio / Son' },
    { id: 'PODCAST_EPISODE', label: '🎙️ Podcast' },
  ];

  constructor(
    private readonly uploadService: UploadService,
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
      if (!this.title) {
        // Pré-remplir le titre avec le nom du fichier sans extension
        this.title = file.name.replace(/\.[^/.]+$/, '');
      }
    }
  }

  onThumbnailSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedThumbnail = file;
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async submitUpload() {
    if (!this.selectedFile || !this.title || !this.rightsConfirmed) return;

    const user = this.authService.currentUser;
    if (!user) {
      this.errorMessage = 'Vous devez être connecté pour publier du contenu.';
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.uploadProgress = 0;
    this.uploadStep = 'Téléversement du fichier source vers MinIO...';

    try {
      // 1. Upload thumbnail si fournie
      let thumbnailUrl: string | undefined;
      if (this.selectedThumbnail) {
        this.uploadStep = 'Téléversement de la miniature...';
        await new Promise<void>((resolve, reject) => {
          this.uploadService.uploadThumbnail(this.selectedThumbnail!, user.id).subscribe({
            next: (p) => {
              if (p.isDone && p.result) {
                thumbnailUrl = p.result.url;
                resolve();
              }
            },
            error: (err) => reject(err),
          });
        });
      }

      // 2. Upload video file
      this.uploadStep = 'Téléversement du média source...';
      const uploadResult = await new Promise<any>((resolve, reject) => {
        this.uploadService.uploadMedia(this.selectedFile!, user.id, 'videos').subscribe({
          next: (p) => {
            this.uploadProgress = p.progress;
            if (p.isDone && p.result) {
              resolve(p.result);
            }
          },
          error: (err) => reject(err),
        });
      });

      // 3. Créer l'entrée dans la base via API
      this.uploadStep = 'Enregistrement et déclenchement du transcodage FFmpeg...';
      const tags = this.tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const creatorId = user.creatorProfile?.id || user.id;

      this.apiService.createVideo({
        title: this.title,
        description: this.description,
        mediaType: this.selectedType,
        sourceObjectKey: uploadResult.objectKey,
        thumbnailUrl: thumbnailUrl,
        ageRating: this.ageRating,
        tags,
        creatorId,
      }).subscribe({
        next: (videoRes) => {
          this.isUploading = false;
          this.successMessage = `Contenu "${this.title}" publié avec succès ! Le transcodage adaptatif FFmpeg est lancé en tâche de fond.`;
          setTimeout(() => {
            const videoId = videoRes?.data?.id || videoRes?.id;
            if (videoId) {
              this.router.navigate(['/watch', videoId]);
            } else {
              this.router.navigate(['/']);
            }
          }, 1500);
        },
        error: (err) => {
          this.isUploading = false;
          this.errorMessage = `Erreur lors de la création de la vidéo : ${err.error?.message || err.message}`;
        },
      });
    } catch (err: any) {
      this.isUploading = false;
      this.errorMessage = `Échec de l'upload : ${err.error?.message || err.message}`;
    }
  }
}
