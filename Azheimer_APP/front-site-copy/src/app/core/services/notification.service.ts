import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Observable, switchMap } from 'rxjs';

export interface AppNotification {
  id?: number;
  userId: number;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  read: boolean;
  incidentId?: number;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = '/api/users/notifications';
  private unreadCount$ = new BehaviorSubject<number>(0);

  unreadCount = this.unreadCount$.asObservable();

  constructor(private http: HttpClient) {}

  startPolling(userId: number): void {
    interval(30000).pipe(
      switchMap(() => this.getUnreadCount(userId))
    ).subscribe(data => this.unreadCount$.next(data.count));

    // Initial fetch
    this.getUnreadCount(userId).subscribe(data => this.unreadCount$.next(data.count));
  }

  getByUser(userId: number): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.api}/user/${userId}`);
  }

  getUnreadCount(userId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.api}/user/${userId}/count`);
  }

  markRead(id: number): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.api}/${id}/read`, {});
  }

  markAllRead(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.api}/user/${userId}/read-all`, {});
  }

  create(notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): Observable<AppNotification> {
    return this.http.post<AppNotification>(this.api, notification);
  }
}
