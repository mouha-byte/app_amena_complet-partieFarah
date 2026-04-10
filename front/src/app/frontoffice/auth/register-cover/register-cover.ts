import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-auth-register-cover',
  standalone: false,
  templateUrl: './register-cover.html',
  styleUrls: ['./register-cover.css'],
})
export class RegisterCoverAuthPage {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  role: UserRole = 'PATIENT';
  errorMessage = '';
  successMessage = '';
  loading = false;

  roles: { value: UserRole; label: string }[] = [
    { value: 'PATIENT', label: 'Patient' },
    { value: 'CAREGIVER', label: 'Aidant (Caregiver)' },
    { value: 'DOCTOR', label: 'Médecin' },
    { value: 'VOLUNTEER', label: 'Bénévole' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    if (!this.firstName || !this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      role: this.role
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        setTimeout(() => this.router.navigate(['/login-cover']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription. Email déjà utilisé ?';
      }
    });
  }
}
