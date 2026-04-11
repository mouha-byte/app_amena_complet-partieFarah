import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

export interface AuthUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8086/auth';
  private readonly USERS_API_URL = 'http://localhost:8086/users';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Restore user from localStorage on app start
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.currentUserSubject.next(JSON.parse(stored));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password }).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.currentUserSubject.next(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      })
    );
  }

  register(user: { firstname: string; lastname: string; email: string; password: string; phone?: string; role?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, user).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.currentUserSubject.next(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get isDoctor(): boolean {
    return this.currentUser?.role === 'DOCTOR';
  }

  get isPatient(): boolean {
    return this.currentUser?.role === 'PATIENT';
  }

  get isCaregiver(): boolean {
    return this.currentUser?.role === 'CAREGIVER';
  }

  getRole(): string {
    return this.currentUser?.role || '';
  }

  getUserId(): number | null {
    return this.currentUser?.id ?? null;
  }

  getFullName(): string {
    const user = this.currentUser;
    if (!user) return '';
    return `${user.firstname} ${user.lastname}`.trim();
  }

  getPatientsByCaregiver(caregiverId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.USERS_API_URL}/caregiver/${caregiverId}/patients`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.USERS_API_URL}/${id}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.USERS_API_URL);
  }
}
