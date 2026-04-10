import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = '/api/users';
  private storageKey = 'currentUser';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, null, {
      params: { email, password }
    }).pipe(
      tap(user => localStorage.setItem(this.storageKey, JSON.stringify(user)))
    );
  }

  register(user: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.router.navigate(['/']);
  }

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  getRole(): string {
    return this.getCurrentUser()?.role || '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  getUserId(): number | null {
    return this.getCurrentUser()?.userId ?? null;
  }

  getFullName(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  }

  getPatientsByCaregiver(caregiverId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/caregiver/${caregiverId}/patients`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  updateUser(id: number, data: Partial<User> & { caregiverId?: number | null }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }
}
