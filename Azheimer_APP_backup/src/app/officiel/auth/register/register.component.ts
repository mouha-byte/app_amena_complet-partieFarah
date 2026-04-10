import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  error = ''; success = ''; loading = false; showPwd = false;
  roles = [
    { v: 'PATIENT', l: '🧑 Patient', d: 'Suivi cognitif' },
    { v: 'CAREGIVER', l: '🤝 Aidant', d: 'Accompagnement' },
    { v: 'DOCTOR', l: '🩺 Médecin', d: 'Suivi médical' },
    { v: 'ADMIN', l: '👑 Admin', d: 'Gestion complète' }
  ];

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn) this.router.navigate(['/officiel/dashboard']);
  }

  submit() {
    this.error = ''; this.success = '';
    if (!this.firstname || !this.lastname || !this.email || !this.password) { this.error = 'Champs obligatoires manquants.'; return; }
    if (this.password.length < 4) { this.error = 'Mot de passe trop court (min 4).'; return; }
    if (this.password !== this.confirm) { this.error = 'Mots de passe différents.'; return; }
    this.loading = true;
    this.auth.register({ firstname: this.firstname, lastname: this.lastname, email: this.email, password: this.password, phone: this.phone || undefined, role: this.role }).subscribe({
      next: (r: any) => { this.loading = false; if (r.success) { this.success = 'Compte créé !'; setTimeout(() => this.router.navigate(['/officiel/dashboard']), 1200); } else this.error = r.message; },
      error: (e: any) => { this.loading = false; this.error = e.status === 409 ? 'Email déjà utilisé.' : e.error?.message || 'Erreur.'; }
    });
  }
}
