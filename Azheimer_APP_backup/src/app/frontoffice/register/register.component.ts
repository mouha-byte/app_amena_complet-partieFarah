import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  firstname = '';
  lastname = '';
  email = '';
  password = '';
  confirmPassword = '';
  phone = '';
  role = 'PATIENT';
  errorMessage = '';
  successMessage = '';
  loading = false;
  showPassword = false;

  roles = [
    { value: 'PATIENT', label: '🧑 Patient', desc: 'Suivi cognitif personnel' },
    { value: 'CAREGIVER', label: '🤝 Aidant', desc: 'Accompagnement d\'un patient' },
    { value: 'DOCTOR', label: '🩺 Médecin', desc: 'Suivi professionnel' },
    { value: 'ADMIN', label: '👑 Administrateur', desc: 'Gestion complète' }
  ];

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
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
        this.loading = false;
        if (response.success) {
          this.successMessage = 'Compte créé avec succès ! Redirection...';
          setTimeout(() => {
            const role = response.user?.role;
            if (role === 'ADMIN' || role === 'DOCTOR') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/']);
            }
          }, 1500);
        } else {
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
}
