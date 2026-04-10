import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:600px">
      <h1 style="font-size:24px;font-weight:700;margin-bottom:24px">Mon profil</h1>

      @if (success) {
        <div class="alert-success" style="margin-bottom:16px">Profil mis à jour !</div>
      }

      <div class="card-alzcare">
        <!-- Avatar -->
        <div style="text-align:center;margin-bottom:24px">
          <div style="width:80px;height:80px;border-radius:50%;background:#eff6ff;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
            <i class="fa-solid fa-user" style="font-size:32px;color:#3b82f6"></i>
          </div>
          <h2 style="font-size:18px;font-weight:600">{{ user?.firstName }} {{ user?.lastName }}</h2>
          <span class="badge-alz" [style]="getRoleBadge()">{{ getRoleLabel() }}</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Prénom</label>
            <input class="form-input" [(ngModel)]="form.firstName">
          </div>
          <div class="form-group">
            <label class="form-label">Nom</label>
            <input class="form-input" [(ngModel)]="form.lastName">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" type="email" [(ngModel)]="form.email" readonly style="background:#f8fafc">
        </div>

        <div class="form-group">
          <label class="form-label">Téléphone</label>
          <input class="form-input" type="tel" [(ngModel)]="form.phone">
        </div>

        <div class="form-group">
          <label class="form-label">Rôle</label>
          <input class="form-input" [value]="getRoleLabel()" readonly style="background:#f8fafc">
        </div>

        <button class="btn-primary-alz" style="width:100%;margin-top:12px" (click)="save()">
          <i class="fa-solid fa-save"></i> Enregistrer
        </button>
      </div>
    </div>
  `
})
export class ProfilePage implements OnInit {
  user: User | null = null;
  form: any = { firstName: '', lastName: '', email: '', phone: '' };
  success = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.form = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone || ''
      };
    }
  }

  save(): void {
    if (!this.user) return;
    this.authService.updateUser(this.user.userId, this.form).subscribe(updated => {
      localStorage.setItem('currentUser', JSON.stringify({ ...this.user, ...updated }));
      this.user = this.authService.getCurrentUser();
      this.success = true;
      setTimeout(() => this.success = false, 3000);
    });
  }

  getRoleLabel(): string {
    const m: Record<string, string> = { ADMIN: 'Administrateur', DOCTOR: 'Médecin', CAREGIVER: 'Aidant', PATIENT: 'Patient', VOLUNTEER: 'Bénévole' };
    return m[this.user?.role || ''] || '';
  }

  getRoleBadge(): string {
    const m: Record<string, string> = { ADMIN: 'background:#dbeafe;color:#1d4ed8', DOCTOR: 'background:#d1fae5;color:#059669', CAREGIVER: 'background:#fef3c7;color:#b45309', PATIENT: 'background:#ede9fe;color:#7c3aed' };
    return m[this.user?.role || ''] || 'background:#f1f5f9;color:#64748b';
  }
}
