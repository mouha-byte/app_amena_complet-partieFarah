import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-activity-entry',
  standalone: true,
  template: `
    <div style="display:flex;justify-content:center;align-items:center;min-height:50vh;">
      <div class="spinner" aria-label="Chargement du module activity"></div>
    </div>
  `
})
export class ActivityEntryComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const role = this.authService.getRole();

    if (role === 'ADMIN' || role === 'DOCTOR') {
      this.router.navigate(['/crud/activity/manage']);
      return;
    }

    if (role === 'PATIENT' || role === 'CAREGIVER') {
      this.router.navigate(['/crud/activity/play']);
      return;
    }

    this.router.navigate(['/login'], { queryParams: { returnUrl: '/crud/activity' } });
  }
}
