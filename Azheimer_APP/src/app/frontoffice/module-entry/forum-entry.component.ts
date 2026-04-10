import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forum-entry',
  standalone: true,
  template: `
    <div style="display:flex;justify-content:center;align-items:center;min-height:50vh;">
      <div class="spinner" aria-label="Chargement du module forum"></div>
    </div>
  `
})
export class ForumEntryComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const role = this.authService.getRole();

    if (role === 'ADMIN') {
      this.router.navigate(['/crud/forum/admin']);
      return;
    }

    if (role === 'DOCTOR' || role === 'PATIENT' || role === 'CAREGIVER') {
      this.router.navigate(['/crud/forum/community']);
      return;
    }

    this.router.navigate(['/login'], { queryParams: { returnUrl: '/crud/forum' } });
  }
}
