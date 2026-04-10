import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)">
      <div style="background:#fff;border-radius:16px;padding:48px;width:100%;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.2)">
        <div style="text-align:center;margin-bottom:32px">
          <div style="width:56px;height:56px;background:#3b82f6;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
            <i class="fa-solid fa-brain" style="color:#fff;font-size:24px"></i>
          </div>
          <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:4px">Créer un compte</h1>
          <p style="font-size:14px;color:#64748b">Rejoignez la plateforme AlzCare</p>
        </div>

        @if (errorMessage) {
          <div class="alert-error" style="margin-bottom:16px">
            <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}
          </div>
        }
        @if (successMessage) {
          <div class="alert-success" style="margin-bottom:16px">
            <i class="fa-solid fa-check-circle"></i> {{ successMessage }}
          </div>
        }

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Prénom</label>
            <input class="form-input" [(ngModel)]="user.firstName" placeholder="Prénom">
          </div>
          <div class="form-group">
            <label class="form-label">Nom</label>
            <input class="form-input" [(ngModel)]="user.lastName" placeholder="Nom">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" type="email" [(ngModel)]="user.email" placeholder="votre&#64;email.com">
        </div>

        <div class="form-group">
          <label class="form-label">Téléphone</label>
          <input class="form-input" type="tel" [(ngModel)]="user.phone" placeholder="+216 XX XXX XXX">
        </div>

        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <input class="form-input" type="password" [(ngModel)]="user.password" placeholder="••••••••">
        </div>

        <div class="form-group">
          <label class="form-label">Rôle</label>
          <select class="form-select" [(ngModel)]="user.role" (ngModelChange)="onRoleChange()">
            <option value="">-- Choisir --</option>
            <option value="PATIENT">Patient</option>
            <option value="CAREGIVER">Aidant / Soignant</option>
            <option value="DOCTOR">Médecin</option>
          </select>
        </div>

        @if (user.role === 'CAREGIVER') {
          <div class="form-group">
            <label class="form-label">Patient concerné</label>
            @if (patientsLoading) {
              <p style="font-size:13px;color:#94a3b8;padding:8px 0">Chargement des patients...</p>
            } @else if (patients.length === 0) {
              <p style="font-size:13px;color:#94a3b8;padding:8px 0">Aucun patient inscrit pour le moment.</p>
            } @else {
              <select class="form-select" [(ngModel)]="selectedPatientId">
                <option [ngValue]="null">-- Sélectionner un patient --</option>
                @for (p of patients; track p.userId) {
                  <option [ngValue]="p.userId">{{ p.firstName }} {{ p.lastName }} ({{ p.email }})</option>
                }
              </select>
            }
          </div>
        }

        <button class="btn-primary-alz" style="width:100%;margin-top:8px;padding:12px" [disabled]="loading" (click)="onRegister()">
          @if (loading) {
            <span class="spinner" style="display:inline-block;width:18px;height:18px;margin-right:8px;vertical-align:middle"></span>
          }
          S'inscrire
        </button>

        <p style="text-align:center;margin-top:20px;font-size:14px;color:#64748b">
          Déjà un compte ?
          <a routerLink="/login" style="color:#3b82f6;font-weight:500;text-decoration:none">Se connecter</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterPage implements OnInit {
  user: any = { firstName: '', lastName: '', email: '', phone: '', password: '', role: '' };
  errorMessage = '';
  successMessage = '';
  loading = false;
  patients: User[] = [];
  patientsLoading = false;
  selectedPatientId: number | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientsLoading = true;
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.patients = users.filter(u => u.role === 'PATIENT');
        this.patientsLoading = false;
      },
      error: () => {
        this.patientsLoading = false;
      }
    });
  }

  onRoleChange(): void {
    if (this.user.role === 'CAREGIVER' && this.patients.length === 0) {
      this.loadPatients();
    }
    if (this.user.role !== 'CAREGIVER') {
      this.selectedPatientId = null;
    }
  }

  onRegister(): void {
    if (!this.user.firstName || !this.user.lastName || !this.user.email || !this.user.password || !this.user.role) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const payload: any = { ...this.user };
    if (this.user.role === 'CAREGIVER' && this.selectedPatientId) {
      payload.patientId = this.selectedPatientId;
    }

    this.loading = true;
    this.errorMessage = '';
    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
      }
    });
  }
}
