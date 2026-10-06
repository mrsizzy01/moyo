import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface UploadProgress {
  progress: number; // 0 - 100
  isDone: boolean;
  result?: {
    objectKey: string;
    url: string;
    sizeBytes: number;
    mimeType: string;
    originalName: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly baseUrl = 'http://localhost:3000/api/upload';

  constructor(private readonly http: HttpClient) {}

  uploadMedia(file: File, userId: string, folder = 'videos'): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('folder', folder);

    const req = new HttpRequest('POST', `${this.baseUrl}/media`, formData, {
      reportProgress: true,
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
          return { progress, isDone: false };
        } else if (event.type === HttpEventType.Response) {
          return {
            progress: 100,
            isDone: true,
            result: event.body?.data,
          };
        }
        return { progress: 0, isDone: false };
      }),
    );
  }

  uploadThumbnail(file: File, userId: string): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    const req = new HttpRequest('POST', `${this.baseUrl}/thumbnail`, formData, {
      reportProgress: true,
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
          return { progress, isDone: false };
        } else if (event.type === HttpEventType.Response) {
          return {
            progress: 100,
            isDone: true,
            result: event.body?.data,
          };
        }
        return { progress: 0, isDone: false };
      }),
    );
  }
}
