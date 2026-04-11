import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-off-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.css']
})
export class OfficielRegisterComponent {
  firstname = ''; lastname = ''; email = ''; password = ''; confirm = ''; phone = '';
  role = 'PATIENT';
  caregiverId: number | null = null;
  error = ''; success = ''; loading = false; showPwd = false;
  caregiversLoading = false;
  caregiverOptions: Array<{ id: number; label: string; email: string }> = [];
  private readonly patientsApi = 'http://localhost:8086/patients';
  roles = [
    { v: 'PATIENT', l: '🧑 Patient', d: 'Suivi cognitif' },
    { v: 'CAREGIVER', l: '🤝 Aidant', d: 'Accompagnement' },
    { v: 'DOCTOR', l: '🩺 Médecin', d: 'Suivi médical' },
    { v: 'ADMIN', l: '👑 Admin', d: 'Gestion complète' }
  ];

  constructor(private auth: AuthService, private router: Router, private http: HttpClient) {
    if (this.auth.isLoggedIn) this.router.navigate(['/officiel/dashboard']);
    this.loadCaregivers();
  }

  onRoleChange() {
    if (this.role !== 'PATIENT') {
      this.caregiverId = null;
    }
  }

  submit() {
    this.error = ''; this.success = '';
    if (!this.firstname || !this.lastname || !this.email || !this.password) { this.error = 'Champs obligatoires manquants.'; return; }
    if (this.password.length < 4) { this.error = 'Mot de passe trop court (min 4).'; return; }
    if (this.password !== this.confirm) { this.error = 'Mots de passe différents.'; return; }
    if (this.role === 'PATIENT' && !this.caregiverId) { this.error = 'Veuillez choisir un aidant dans la liste.'; return; }
    if (this.role === 'PATIENT' && this.caregiverOptions.length === 0) { this.error = 'Aucun aidant disponible.'; return; }

    this.loading = true;
    this.auth.register({ firstname: this.firstname, lastname: this.lastname, email: this.email, password: this.password, phone: this.phone || undefined, role: this.role }).subscribe({
      next: (r: any) => {
        if (!r.success) {
          this.loading = false;
          this.error = r.message;
          return;
        }

        this.success = 'Compte créé !';

        if (this.role === 'PATIENT') {
          this.createPatientProfile(r.user?.id ?? null);
          return;
        }

        this.loading = false;
        this.redirectToDashboard();
      },
      error: (e: any) => { this.loading = false; this.error = e.status === 409 ? 'Email déjà utilisé.' : e.error?.message || 'Erreur.'; }
    });
  }

  private loadCaregivers(): void {
    this.caregiversLoading = true;
    this.auth.getAllUsers().subscribe({
      next: (users: any[]) => {
        this.caregiverOptions = (users || [])
          .filter((u) => (u?.role || '').toUpperCase() === 'CAREGIVER')
          .map((u) => {
            const id = Number(u?.id ?? u?.userId ?? 0);
            const firstname = (u?.firstname ?? u?.firstName ?? '').toString();
            const lastname = (u?.lastname ?? u?.lastName ?? '').toString();
            const email = (u?.email ?? '').toString();
            const fullName = `${firstname} ${lastname}`.trim();
            const label = fullName ? `${fullName} (${email})` : email;
            return { id, label, email };
          })
          .filter((c) => c.id > 0);
        this.caregiversLoading = false;
      },
      error: () => {
        this.caregiverOptions = [];
        this.caregiversLoading = false;
      }
    });
  }

  private createPatientProfile(patientUserId: number | null): void {
    const selectedCaregiver = this.caregiverOptions.find((c) => c.id === this.caregiverId);

    if (!patientUserId || !selectedCaregiver) {
      this.loading = false;
      this.error = 'Compte créé, mais liaison patient-aidant impossible.';
      return;
    }

    const payload = {
      user: { id: patientUserId },
      caregiver: { id: selectedCaregiver.id },
      emergencyContact: selectedCaregiver.email || '',
      dateOfBirth: null,
      address: '',
      medicalHistory: ''
    };

    this.http.post(this.patientsApi, payload).subscribe({
      next: () => {
        this.loading = false;
        this.redirectToDashboard();
      },
      error: (e: any) => {
        this.loading = false;
        this.error = e?.error?.message || 'Compte créé, mais la liaison patient-aidant a échoué.';
      }
    });
  }

  private redirectToDashboard(): void {
    setTimeout(() => this.router.navigate(['/officiel/dashboard']), 1200);
  }
}
