import { Component, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('mind_care');

  constructor(private readonly router: Router, private readonly authService: AuthService) {
    this.applyRoleClasses();

    this.authService.currentUser$.subscribe(() => {
      this.applyRoleClasses();
    });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
          preloader.remove();
        }

        this.applyRoleClasses();
      });
  }

  private applyRoleClasses(): void {
    const body = document.body;
    body.classList.remove('is-authenticated', 'role-admin', 'role-doctor', 'role-patient', 'role-caregiver');

    const role = this.authService.getRole();
    if (!role) {
      return;
    }

    body.classList.add('is-authenticated');

    if (role === 'ADMIN') {
      body.classList.add('role-admin');
      return;
    }

    if (role === 'DOCTOR') {
      body.classList.add('role-doctor');
      return;
    }

    if (role === 'PATIENT') {
      body.classList.add('role-patient');
      return;
    }

    if (role === 'CAREGIVER') {
      body.classList.add('role-caregiver');
    }
  }
}
