import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)">
      <div style="background:#fff;border-radius:16px;padding:48px;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,0.2)">
        <div style="text-align:center;margin-bottom:32px">
          <div style="width:56px;height:56px;background:#3b82f6;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
            <i class="fa-solid fa-brain" style="color:#fff;font-size:24px"></i>
          </div>
          <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:4px">AlzCare</h1>
          <p style="font-size:14px;color:#64748b">Connexion à votre espace</p>
        </div>

        @if (errorMessage) {
          <div class="alert-error" style="margin-bottom:16px">
            <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}
          </div>
        }

        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" type="email" [(ngModel)]="email" placeholder="votre@email.com" (keyup.enter)="onLogin()">
        </div>

        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <input class="form-input" type="password" [(ngModel)]="password" placeholder="••••••••" (keyup.enter)="onLogin()">
        </div>

        <button class="btn-primary-alz" style="width:100%;margin-top:8px;padding:12px" [disabled]="loading" (click)="onLogin()">
          @if (loading) {
            <span class="spinner" style="display:inline-block;width:18px;height:18px;margin-right:8px;vertical-align:middle"></span>
          }
          Se connecter
        </button>

        <p style="text-align:center;margin-top:20px;font-size:14px;color:#64748b">
          Pas encore de compte ?
          <a routerLink="/register" style="color:#3b82f6;font-weight:500;text-decoration:none">S'inscrire</a>
        </p>
      </div>
    </div>
  `
})
export class LoginPage {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        const role = this.authService.getRole();
        if (role === 'PATIENT' || role === 'CAREGIVER') {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Email ou mot de passe incorrect.';
      }
    });
  }
}
