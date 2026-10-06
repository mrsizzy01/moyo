import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private readonly http: HttpClient) {}

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }

  register(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, payload);
  }

  login(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, payload);
  }
}
