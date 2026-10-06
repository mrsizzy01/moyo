import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { VideoPlayerComponent } from '../../components/player/video-player.component';
import { AudioPlayerComponent } from '../../components/player/audio-player.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule, RouterLink, VideoPlayerComponent, AudioPlayerComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-moyo-dark">
      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center min-h-screen">
        <div class="w-10 h-10 border-4 border-moyo-accent/30 border-t-moyo-accent rounded-full animate-spin"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading() && !video()" class="flex flex-col items-center justify-center min-h-screen gap-4">
        <p class="text-4xl">🎬</p>
        <p class="text-white font-bold text-xl">Contenu introuvable</p>
        <a routerLink="/" class="btn-primary">Retour à l'accueil</a>
      </div>

      <!-- Main Content -->
      <div *ngIf="!loading() && video()" class="max-w-7xl mx-auto px-4 pt-6 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Left Column: Player + Info -->
        <div class="lg:col-span-2 space-y-4">

          <!-- Video Player -->
          <div class="rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl" *ngIf="isVideo()">
            <app-video-player [src]="video()!.masterPlaylistUrl" [videoId]="video()!.id"></app-video-player>
          </div>

          <!-- Audio Player -->
          <div class="rounded-2xl overflow-hidden" *ngIf="!isVideo()">
            <app-audio-player [src]="video()!.masterPlaylistUrl" [title]="video()!.title" [cover]="video()!.thumbnailUrl"></app-audio-player>
          </div>

          <!-- Video Info -->
          <div class="glass-panel rounded-2xl p-5 border border-moyo-border space-y-3">
            <div class="flex items-start justify-between gap-3">
              <h1 class="text-xl font-bold text-white leading-snug flex-1">{{ video()!.title }}</h1>
              <span class="badge badge-accent shrink-0">{{ video()!.mediaType }}</span>
            </div>

            <div class="flex flex-wrap gap-3 text-sm text-moyo-muted">
              <span>👁 {{ video()!.viewsCount | number }} vues</span>
              <span>❤ {{ video()!.likesCount | number }} likes</span>
              <span *ngIf="video()!.durationSeconds">⏱ {{ formatDuration(video()!.durationSeconds) }}</span>
              <span>🗓 {{ video()!.publishedAt | date:'mediumDate' }}</span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 pt-1">
              <button (click)="toggleLike()" [class.text-moyo-accent]="liked()" class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all text-white border border-moyo-border">
                <span>{{ liked() ? '❤️' : '🤍' }}</span> {{ liked() ? 'Aimé' : 'Aimer' }}
              </button>
              <button class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all text-white border border-moyo-border">
                🔗 Partager
              </button>
              <button (click)="openReport()" class="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-moyo-muted border border-moyo-border">
                🚩 Signaler
              </button>
            </div>

            <!-- Description -->
            <div *ngIf="video()!.description" class="pt-2 border-t border-moyo-border">
              <p class="text-sm text-moyo-muted leading-relaxed whitespace-pre-line">{{ video()!.description }}</p>
            </div>

            <!-- Tags -->
            <div *ngIf="video()!.tags?.length" class="flex flex-wrap gap-2 pt-1">
              <span *ngFor="let tag of video()!.tags" class="px-2.5 py-1 rounded-full text-xs bg-moyo-card border border-moyo-border text-moyo-muted">#{{ tag }}</span>
            </div>
          </div>

          <!-- Creator Card -->
          <div class="glass-panel rounded-2xl p-4 border border-moyo-border flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-moyo-card border border-moyo-border overflow-hidden flex items-center justify-center text-2xl shrink-0">
              <img *ngIf="video()!.creator?.avatarUrl" [src]="video()!.creator!.avatarUrl" class="w-full h-full object-cover rounded-full" [alt]="video()!.creator?.channelName" />
              <span *ngIf="!video()!.creator?.avatarUrl">👤</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white">{{ video()!.creator?.channelName }}</span>
                <svg *ngIf="video()!.creator?.isVerified" class="w-4 h-4 text-moyo-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p class="text-xs text-moyo-muted">{{ video()!.creator?.subscribersCount | number }} abonnés</p>
            </div>
            <button (click)="toggleFollow()" [class.btn-primary]="!following()" [class.btn-outline]="following()" class="shrink-0 text-sm px-4 py-2 rounded-xl font-semibold transition-all border">
              {{ following() ? '✓ Abonné' : '+ S'abonner' }}
            </button>
          </div>

          <!-- Comments -->
          <div class="glass-panel rounded-2xl p-5 border border-moyo-border space-y-4">
            <h2 class="font-bold text-white text-base">💬 Commentaires ({{ commentsTotal() }})</h2>

            <!-- Write Comment -->
            <div class="flex gap-3">
              <div class="w-9 h-9 rounded-full bg-moyo-card border border-moyo-border flex items-center justify-center text-sm shrink-0">👤</div>
              <div class="flex-1 space-y-2">
                <textarea [(ngModel)]="newComment" placeholder="Laisser un commentaire..." rows="2"
                  class="w-full bg-moyo-card border border-moyo-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-moyo-muted focus:outline-none focus:border-moyo-accent resize-none transition-colors"></textarea>
                <button (click)="postComment()" [disabled]="!newComment.trim()" class="btn-primary text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  Publier
                </button>
              </div>
            </div>

            <!-- Comment List -->
            <div class="space-y-3 divide-y divide-moyo-border">
              <div *ngFor="let c of comments()" class="pt-3 first:pt-0 flex gap-3">
                <div class="w-8 h-8 rounded-full bg-moyo-card border border-moyo-border flex items-center justify-center text-xs shrink-0">
                  <img *ngIf="c.user?.avatarUrl" [src]="c.user!.avatarUrl" class="w-full h-full object-cover rounded-full" />
                  <span *ngIf="!c.user?.avatarUrl">👤</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-semibold text-white">{{ c.user?.displayName || c.user?.username }}</span>
                    <span class="text-xs text-moyo-muted">{{ c.createdAt | date:'d MMM y' }}</span>
                  </div>
                  <p class="text-sm text-moyo-muted mt-1 leading-relaxed">{{ c.content }}</p>
                </div>
              </div>
            </div>

            <button *ngIf="commentsTotal() > comments().length" (click)="loadMoreComments()"
              class="text-sm text-moyo-accent hover:underline font-medium w-full text-center py-2">
              Voir plus de commentaires
            </button>
          </div>
        </div>

        <!-- Right Column: Suggestions -->
        <div class="space-y-3">
          <h3 class="text-sm font-bold text-white uppercase tracking-wide opacity-70">Suggestions</h3>
          <div *ngFor="let v of suggestions()" class="glass-panel rounded-xl border border-moyo-border p-3 flex gap-3 hover:border-moyo-accent/30 cursor-pointer transition-colors group" [routerLink]="['/watch', v.id]">
            <div class="w-28 h-16 rounded-lg overflow-hidden bg-moyo-dark flex-shrink-0 border border-moyo-border">
              <img *ngIf="v.thumbnailUrl" [src]="v.thumbnailUrl" [alt]="v.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div *ngIf="!v.thumbnailUrl" class="w-full h-full flex items-center justify-center text-moyo-muted">🎬</div>
            </div>
            <div class="flex-1 overflow-hidden">
              <p class="text-xs font-semibold text-white line-clamp-2 leading-tight">{{ v.title }}</p>
              <p class="text-xs text-moyo-muted mt-1">{{ v.creator?.channelName }}</p>
              <p class="text-xs text-moyo-muted">{{ v.viewsCount | number }} vues</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Modal -->
      <div *ngIf="reportOpen" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="glass-panel rounded-2xl p-6 w-full max-w-sm border border-moyo-border space-y-4">
          <h3 class="font-bold text-white">🚩 Signaler ce contenu</h3>
          <select [(ngModel)]="reportReason" class="w-full bg-moyo-card border border-moyo-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
            <option value="INAPPROPRIATE_CONTENT">Contenu inapproprié</option>
            <option value="COPYRIGHT_VIOLATION">Violation de droits d'auteur</option>
            <option value="SPAM">Spam</option>
            <option value="MISINFORMATION">Désinformation</option>
            <option value="HATE_SPEECH">Discours haineux</option>
            <option value="VIOLENCE">Violence</option>
          </select>
          <textarea [(ngModel)]="reportDetails" placeholder="Détails supplémentaires (optionnel)" rows="3"
            class="w-full bg-moyo-card border border-moyo-border rounded-xl px-3 py-2 text-sm text-white placeholder-moyo-muted focus:outline-none resize-none"></textarea>
          <div class="flex gap-2">
            <button (click)="submitReport()" class="btn-primary flex-1">Envoyer</button>
            <button (click)="reportOpen = false" class="btn-outline flex-1">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WatchComponent implements OnInit {
  video = signal<any>(null);
  loading = signal(true);
  liked = signal(false);
  following = signal(false);
  comments = signal<any[]>([]);
  commentsTotal = signal(0);
  suggestions = signal<any[]>([]);

  newComment = '';
  reportOpen = false;
  reportReason = 'INAPPROPRIATE_CONTENT';
  reportDetails = '';

  private userId = localStorage.getItem('moyo_user_id') ?? '';
  private commentPage = 1;

  isVideo = computed(() => {
    const type = this.video()?.mediaType;
    return type === 'FILM' || type === 'SERIES_EPISODE' || type === 'SHORT' || type === 'DOCUMENTARY' || type === 'VIDEO';
  });

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id')!;
      this.loadVideo(id);
    });
  }

  private loadVideo(id: string) {
    this.loading.set(true);
    this.http.get<any>(`http://localhost:3000/api/videos/${id}`).subscribe({
      next: (res) => {
        this.video.set(res.data);
        this.loading.set(false);
        this.loadComments(id);
        this.loadSuggestions(res.data.mediaType);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadComments(videoId: string) {
    this.http.get<any>(`http://localhost:3000/api/social/comments/${videoId}?page=1`).subscribe(res => {
      this.comments.set(res.data.items);
      this.commentsTotal.set(res.data.total);
    });
  }

  private loadSuggestions(mediaType: string) {
    this.http.get<any>(`http://localhost:3000/api/videos?mediaType=${mediaType}&limit=8`).subscribe(res => {
      this.suggestions.set(res.data?.items || []);
    });
  }

  loadMoreComments() {
    this.commentPage++;
    this.http.get<any>(`http://localhost:3000/api/social/comments/${this.video()!.id}?page=${this.commentPage}`).subscribe(res => {
      this.comments.update(curr => [...curr, ...res.data.items]);
    });
  }

  toggleLike() {
    if (!this.userId) return;
    this.http.post<any>(`http://localhost:3000/api/social/likes/${this.video()!.id}`, { userId: this.userId }).subscribe(res => {
      this.liked.set(res.data.liked);
    });
  }

  toggleFollow() {
    if (!this.userId) return;
    this.http.post<any>(`http://localhost:3000/api/social/follow/${this.video()!.creator.id}`, { followerId: this.userId }).subscribe(res => {
      this.following.set(res.data.following);
    });
  }

  postComment() {
    if (!this.newComment.trim() || !this.userId) return;
    this.http.post<any>(`http://localhost:3000/api/social/comments/${this.video()!.id}`, { userId: this.userId, content: this.newComment }).subscribe(res => {
      this.comments.update(curr => [res.data, ...curr]);
      this.commentsTotal.update(t => t + 1);
      this.newComment = '';
    });
  }

  openReport() { this.reportOpen = true; }

  submitReport() {
    this.http.post(`http://localhost:3000/api/moderation/reports`, {
      reporterId: this.userId,
      targetType: 'Video',
      targetId: this.video()!.id,
      reason: this.reportReason,
      details: this.reportDetails
    }).subscribe(() => { this.reportOpen = false; });
  }

  formatDuration(s: number): string {
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h${String(m % 60).padStart(2, '0')}`;
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  }
}
