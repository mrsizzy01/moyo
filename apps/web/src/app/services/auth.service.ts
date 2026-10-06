import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: 'VIEWER' | 'CREATOR' | 'MODERATOR' | 'ADMIN';
  creatorProfile?: {
    id: string;
    channelName: string;
    slug: string;
    avatarUrl?: string;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  private getStoredUser(): User | null {
    try {
      const data = localStorage.getItem('moyo_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('moyo_token');
  }

  register(data: { email: string; username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  logout() {
    localStorage.removeItem('moyo_token');
    localStorage.removeItem('moyo_refresh_token');
    localStorage.removeItem('moyo_user');
    this.currentUserSubject.next(null);
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem('moyo_token', res.accessToken);
    if (res.refreshToken) {
      localStorage.setItem('moyo_refresh_token', res.refreshToken);
    }
    localStorage.setItem('moyo_user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }
}
