import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  firstname = '';
  lastname = '';
  email = '';
  password = '';
  confirmPassword = '';
  phone = '';
  role = 'PATIENT';
  caregiverId: number | null = null;
  errorMessage = '';
  successMessage = '';
  loading = false;
  showPassword = false;
  caregiversLoading = false;
  caregiverOptions: Array<{ id: number; label: string; email: string }> = [];
  private readonly patientsApi = 'http://localhost:8086/patients';

  roles = [
    { value: 'PATIENT', label: '🧑 Patient', desc: 'Suivi cognitif personnel' },
    { value: 'CAREGIVER', label: '🤝 Aidant', desc: 'Accompagnement d\'un patient' },
    { value: 'DOCTOR', label: '🩺 Médecin', desc: 'Suivi professionnel' },
    { value: 'ADMIN', label: '👑 Administrateur', desc: 'Gestion complète' }
  ];

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.loadCaregivers();
  }

  onRoleChange(): void {
    if (this.role !== 'PATIENT') {
      this.caregiverId = null;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.firstname || !this.lastname || !this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    if (this.password.length < 4) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 4 caractères.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.role === 'PATIENT' && !this.caregiverId) {
      this.errorMessage = 'Veuillez choisir un aidant depuis la liste.';
      return;
    }

    if (this.role === 'PATIENT' && this.caregiverOptions.length === 0) {
      this.errorMessage = 'Aucun aidant disponible pour créer un patient.';
      return;
    }

    this.loading = true;

    this.authService.register({
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      phone: this.phone || undefined,
      role: this.role
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Compte créé avec succès ! Redirection...';

          if (this.role === 'PATIENT') {
            this.createPatientProfile(response.user?.id ?? null, response.user?.role || this.role);
            return;
          }

          this.loading = false;
          this.redirectAfterRegister(response.user?.role);
        } else {
          this.loading = false;
          this.errorMessage = response.message || 'Erreur lors de la création du compte.';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.errorMessage = 'Un compte avec cet email existe déjà.';
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur.';
        } else {
          this.errorMessage = err.error?.message || 'Erreur lors de la création du compte.';
        }
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private loadCaregivers(): void {
    this.caregiversLoading = true;
    this.authService.getAllUsers().subscribe({
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

  private createPatientProfile(patientUserId: number | null, registeredRole: string): void {
    const selectedCaregiver = this.caregiverOptions.find((c) => c.id === this.caregiverId);

    if (!patientUserId || !selectedCaregiver) {
      this.loading = false;
      this.errorMessage = 'Compte créé, mais liaison patient-aidant impossible.';
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
        this.redirectAfterRegister(registeredRole);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Compte créé, mais la liaison patient-aidant a échoué.';
      }
    });
  }

  private redirectAfterRegister(role?: string): void {
    setTimeout(() => {
      if (role === 'ADMIN' || role === 'DOCTOR' || role === 'CAREGIVER') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    }, 1500);
  }
}
