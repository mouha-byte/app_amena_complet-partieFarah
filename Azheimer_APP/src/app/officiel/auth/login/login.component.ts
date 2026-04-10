import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-off-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class OfficielLoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPwd = false;

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn) this.router.navigate(['/officiel/dashboard']);
  }

  submit() {
    if (!this.email || !this.password) { this.error = 'Remplissez tous les champs.'; return; }
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (r: any) => { this.loading = false; if (r.success) this.router.navigate(['/officiel/dashboard']); else this.error = r.message; },
      error: (e: any) => { this.loading = false; this.error = e.status === 401 ? 'Email ou mot de passe incorrect.' : e.status === 0 ? 'Serveur inaccessible.' : (e.error?.message || 'Erreur.'); }
    });
  }

  fill(email: string, pwd: string) { this.email = email; this.password = pwd; }
}
