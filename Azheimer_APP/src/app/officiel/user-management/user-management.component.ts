import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-off-user-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['../quiz-management/quiz-management.component.css', './user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  caregivers: any[] = [];
  patientProfiles: any[] = [];
  loading = true;
  showForm = false;
  editing = false;
  msg = '';
  msgType = '';
  private readonly api = 'http://localhost:8086/users';
  private readonly authApi = 'http://localhost:8086/auth/register';
  private readonly patientsApi = 'http://localhost:8086/patients';

  form: any = this.emptyForm();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  emptyForm() {
    return {
      id: null,
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      phone: '',
      role: 'PATIENT',
      caregiverId: null,
    };
  }

  load() {
    this.loading = true;
    forkJoin({
      users: this.http.get<any[]>(this.api).pipe(catchError(() => of([]))),
      patients: this.http.get<any[]>(this.patientsApi).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ users, patients }) => {
        this.users = users || [];
        this.patientProfiles = patients || [];
        this.caregivers = this.users.filter((u) => u.role === 'CAREGIVER');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.showMsg('Erreur de chargement', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  openCreate() { this.form = this.emptyForm(); this.editing = false; this.showForm = true; }

  openEdit(u: any) {
    const profile = this.findPatientProfileByUserId(u.id);
    this.form = {
      ...u,
      password: '',
      caregiverId: profile?.caregiver?.id ?? null,
    };
    this.editing = true;
    this.showForm = true;
  }

  save() {
    if (this.form.role === 'PATIENT' && !this.form.caregiverId) {
      this.showMsg('Veuillez sélectionner un aidant pour ce patient.', 'error');
      return;
    }

    if (this.editing) {
      const data = { ...this.form };
      delete data.caregiverId;
      if (!data.password) delete data.password;
      this.http.put(`${this.api}/${data.id}`, data).subscribe({
        next: () => {
          this.syncPatientProfile(data.id, () => {
            this.showMsg('Utilisateur mis à jour ✅', 'success');
            this.showForm = false;
            this.load();
            this.cdr.detectChanges();
          });
        },
        error: (e) => { this.showMsg('Erreur: ' + (e.error?.message || e.message), 'error'); this.cdr.detectChanges(); }
      });
    } else {
      const registrationPayload = {
        firstname: this.form.firstname,
        lastname: this.form.lastname,
        email: this.form.email,
        password: this.form.password,
        phone: this.form.phone,
        role: this.form.role,
      };

      this.http.post<any>(this.authApi, registrationPayload).subscribe({
        next: (response) => {
          const createdUserId = Number(response?.user?.id || 0);
          if (this.form.role === 'PATIENT' && !createdUserId) {
            this.showMsg('Utilisateur créé mais profil patient introuvable.', 'error');
            this.load();
            this.cdr.detectChanges();
            return;
          }

          this.syncPatientProfile(createdUserId, () => {
            this.showMsg('Utilisateur créé ✅', 'success');
            this.showForm = false;
            this.load();
            this.cdr.detectChanges();
          });
        },
        error: (e) => { this.showMsg('Erreur: ' + (e.error?.message || e.message), 'error'); this.cdr.detectChanges(); }
      });
    }
  }

  delete(id: number) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.http.delete(`${this.api}/${id}`).subscribe({
      next: () => { this.showMsg('Supprimé ✅', 'success'); this.load(); this.cdr.detectChanges(); },
      error: () => { this.showMsg('Erreur suppression', 'error'); this.cdr.detectChanges(); }
    });
  }

  showMsg(m: string, t: string) {
    this.msg = m; this.msgType = t;
    setTimeout(() => this.msg = '', 4000);
  }

  onRoleChange() {
    if (this.form.role !== 'PATIENT') {
      this.form.caregiverId = null;
    }
  }

  getLinkedCaregiverLabel(userId: number): string {
    const profile = this.findPatientProfileByUserId(userId);
    if (!profile || !profile.caregiver) {
      return '-';
    }

    const firstname = profile.caregiver.firstname || '';
    const lastname = profile.caregiver.lastname || '';
    const fullName = `${firstname} ${lastname}`.trim();
    return fullName || profile.caregiver.email || '-';
  }

  private findPatientProfileByUserId(userId: number): any | null {
    return this.patientProfiles.find((p) => p?.user?.id === userId) || null;
  }

  private syncPatientProfile(userId: number, onDone: () => void): void {
    if (this.form.role !== 'PATIENT') {
      onDone();
      return;
    }

    const caregiverId = Number(this.form.caregiverId || 0);
    if (!caregiverId) {
      this.showMsg('Veuillez sélectionner un aidant pour ce patient.', 'error');
      return;
    }

    const caregiver = this.users.find((u) => u.id === caregiverId && u.role === 'CAREGIVER');
    if (!caregiver) {
      this.showMsg('Aidant sélectionné introuvable.', 'error');
      return;
    }

    const payload = {
      user: { id: userId },
      caregiver: { id: caregiverId },
      emergencyContact: caregiver.email || '',
      dateOfBirth: null,
      address: '',
      medicalHistory: '',
    };

    const existingProfile = this.findPatientProfileByUserId(userId);
    const request$ = existingProfile
      ? this.http.put(`${this.patientsApi}/${existingProfile.id}`, payload)
      : this.http.post(this.patientsApi, payload);

    request$.subscribe({
      next: () => onDone(),
      error: (e) => {
        this.showMsg('Erreur liaison patient-aidant: ' + (e.error?.message || e.message), 'error');
        this.cdr.detectChanges();
      },
    });
  }

  getRoleBadge(r: string) {
    return { ADMIN: '🛡️', DOCTOR: '🩺', PATIENT: '🧠', CAREGIVER: '🤝' }[r] || '👤';
  }

  getRoleClass(r: string) {
    return { ADMIN: 'role-admin', DOCTOR: 'role-doctor', PATIENT: 'role-patient', CAREGIVER: 'role-care' }[r] || '';
  }
}
