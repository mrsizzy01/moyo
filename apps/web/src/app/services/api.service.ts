import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface HealthResponse {
  status: string;
  platform: string;
  version: string;
  timestamp: string;
  services: {
    api: string;
    database: string;
    redis: string;
    minio: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    const userId = this.auth.currentUser?.id;
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    if (userId) headers = headers.set('x-user-id', userId);
    return headers;
  }

  // ── Health ──
  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }

  // ── Auth ──
  register(payload: any): Observable<any> {
    return this.auth.register(payload);
  }

  login(payload: any): Observable<any> {
    return this.auth.login(payload);
  }

  // ── Videos ──
  getVideos(params?: { page?: number; limit?: number; mediaType?: string }): Observable<any> {
    return this.http.get(`${this.baseUrl}/videos`, { params: params as any });
  }

  getVideoById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/videos/${id}`, { headers: this.getAuthHeaders() });
  }

  createVideo(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/videos`, payload, { headers: this.getAuthHeaders() });
  }

  getMyVideos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/videos/my`, { headers: this.getAuthHeaders() });
  }

  deleteVideo(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/videos/${id}`, { headers: this.getAuthHeaders() });
  }

  // ── Series ──
  getSeries(params?: { page?: number; limit?: number }): Observable<any> {
    return this.http.get(`${this.baseUrl}/series`, { params: params as any });
  }

  getSeriesBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/series/${slug}`);
  }

  // ── Music ──
  getArtists(): Observable<any> {
    return this.http.get(`${this.baseUrl}/music/artists`);
  }

  getAlbums(): Observable<any> {
    return this.http.get(`${this.baseUrl}/music/albums`);
  }

  getTracks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/music/tracks`);
  }

  // ── Podcasts ──
  getPodcasts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/podcasts`);
  }

  getPodcastBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/podcasts/${slug}`);
  }

  // ── Live ──
  getLiveStreams(): Observable<any> {
    return this.http.get(`${this.baseUrl}/live`);
  }

  getLiveByStreamKey(streamKey: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/live/${streamKey}`);
  }

  // ── Channels ──
  getChannel(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/channels/${slug}`, { headers: this.getAuthHeaders() });
  }

  getChannelVideos(slug: string, page = 1, limit = 20): Observable<any> {
    return this.http.get(`${this.baseUrl}/channels/${slug}/videos`, {
      params: { page, limit },
    });
  }

  getChannelSeries(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/channels/${slug}/series`);
  }

  getChannelPodcasts(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/channels/${slug}/podcasts`);
  }

  updateChannel(slug: string, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/channels/${slug}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  // ── Playlists ──
  getMyPlaylists(): Observable<any> {
    return this.http.get(`${this.baseUrl}/playlists/my`, { headers: this.getAuthHeaders() });
  }

  getPlaylist(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/playlists/${id}`, { headers: this.getAuthHeaders() });
  }

  createPlaylist(payload: { title: string; description?: string; isPublic?: boolean }): Observable<any> {
    return this.http.post(`${this.baseUrl}/playlists`, payload, { headers: this.getAuthHeaders() });
  }

  addVideoToPlaylist(playlistId: string, videoId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/playlists/${playlistId}/videos`,
      { videoId },
      { headers: this.getAuthHeaders() },
    );
  }

  removeVideoFromPlaylist(playlistId: string, videoId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/playlists/${playlistId}/videos/${videoId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  deletePlaylist(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/playlists/${id}`, { headers: this.getAuthHeaders() });
  }

  // ── Social & History ──
  likeVideo(videoId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/social/like`, { videoId }, { headers: this.getAuthHeaders() });
  }

  unlikeVideo(videoId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/social/like/${videoId}`, { headers: this.getAuthHeaders() });
  }

  followCreator(creatorId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/social/follow`, { creatorId }, { headers: this.getAuthHeaders() });
  }

  unfollowCreator(creatorId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/social/follow/${creatorId}`, { headers: this.getAuthHeaders() });
  }

  getWatchHistory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/social/history`, { headers: this.getAuthHeaders() });
  }

  updateWatchProgress(videoId: string, progressSeconds: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/social/history`,
      { videoId, progressSeconds },
      { headers: this.getAuthHeaders() },
    );
  }

  // ── Search ──
  search(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search`, { params: { q: query } });
  }

  // ── Admin ──
  getAdminStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/stats`, { headers: this.getAuthHeaders() });
  }

  getAdminUsers(page = 1, limit = 20, search?: string): Observable<any> {
    const params: any = { page, limit };
    if (search) params.search = search;
    return this.http.get(`${this.baseUrl}/admin/users`, {
      params,
      headers: this.getAuthHeaders(),
    });
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/admin/users/${userId}/role`,
      { role },
      { headers: this.getAuthHeaders() },
    );
  }

  toggleUserStatus(userId: string, isActive: boolean): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/admin/users/${userId}/status`,
      { isActive },
      { headers: this.getAuthHeaders() },
    );
  }

  getAdminReports(status?: string, page = 1, limit = 20): Observable<any> {
    const params: any = { page, limit };
    if (status) params.status = status;
    return this.http.get(`${this.baseUrl}/admin/reports`, {
      params,
      headers: this.getAuthHeaders(),
    });
  }

  resolveReport(reportId: string): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/admin/reports/${reportId}/resolve`,
      {},
      { headers: this.getAuthHeaders() },
    );
  }

  dismissReport(reportId: string): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/admin/reports/${reportId}/dismiss`,
      {},
      { headers: this.getAuthHeaders() },
    );
  }

  getAdminAuditLogs(page = 1, limit = 30): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/audit-logs`, {
      params: { page, limit },
      headers: this.getAuthHeaders(),
    });
  }
}
