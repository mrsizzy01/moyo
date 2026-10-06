import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly baseUrl = 'http://localhost:3000/api/notifications';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  private getHeaders(): HttpHeaders {
    const userId = this.auth.currentUser?.id || '';
    return new HttpHeaders({
      'x-user-id': userId,
    });
  }

  loadNotifications(): Observable<any> {
    return this.http
      .get<{ success: boolean; data: { notifications: NotificationItem[]; unreadCount: number } }>(
        this.baseUrl,
        { headers: this.getHeaders() },
      )
      .pipe(
        tap((res) => {
          if (res?.success && res.data) {
            this.notificationsSubject.next(res.data.notifications);
            this.unreadCountSubject.next(res.data.unreadCount);
          }
        }),
      );
  }

  markAsRead(id: string): Observable<any> {
    return this.http
      .patch(`${this.baseUrl}/${id}/read`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          const current = this.notificationsSubject.value.map((n) =>
            n.id === id ? { ...n, isRead: true } : n,
          );
          this.notificationsSubject.next(current);
          this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
        }),
      );
  }

  markAllAsRead(): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/read-all`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          const current = this.notificationsSubject.value.map((n) => ({ ...n, isRead: true }));
          this.notificationsSubject.next(current);
          this.unreadCountSubject.next(0);
        }),
      );
  }
}
