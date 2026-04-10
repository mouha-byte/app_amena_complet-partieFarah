import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-off-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  user: any = null;
  sidebarOpen = true;
  navItems: any[] = [];
  activeInterface: 'localization' | 'activity' = 'activity';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.user = this.auth.currentUser;
    if (!this.user) { this.router.navigate(['/officiel/login']); return; }
    this.updateInterfaceFromUrl(this.router.url);
    this.buildNav();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateInterfaceFromUrl(event.urlAfterRedirects);
        this.buildNav();
      }
    });
  }

  buildNav() {
    const role = this.user?.role;
    const localizationNav = [
      { icon: '📍', label: 'Localisations', link: '/officiel/localizations', roles: ['ADMIN', 'DOCTOR'] },
      { icon: '🛰️', label: 'Suivi Patient', link: '/officiel/movement', roles: ['ADMIN', 'DOCTOR', 'PATIENT'] },
    ];

    const activityNav = [
      { icon: '🧩', label: 'Quiz Management', link: '/officiel/quiz-management', roles: ['ADMIN', 'DOCTOR'] },
      { icon: '📸', label: 'Photo Management', link: '/officiel/photo-management', roles: ['ADMIN', 'DOCTOR'] },
      { icon: '🎮', label: 'Mes Quiz', link: '/officiel/quiz-list', roles: ['PATIENT', 'CAREGIVER'] },
      { icon: '📈', label: 'Résultats & Risque', link: '/officiel/results', roles: ['ADMIN', 'DOCTOR', 'PATIENT'] },
      { icon: '👥', label: 'Utilisateurs', link: '/officiel/users', roles: ['ADMIN'] },
    ];

    const source = this.activeInterface === 'localization' ? localizationNav : activityNav;
    this.navItems = source.filter(item => item.roles.includes(role));
  }

  private updateInterfaceFromUrl(url: string) {
    this.activeInterface = this.isLocalizationUrl(url) ? 'localization' : 'activity';
  }

  private isLocalizationUrl(url: string): boolean {
    return url.startsWith('/officiel/localizations') || url.startsWith('/officiel/movement');
  }

  switchInterface(target: 'localization' | 'activity') {
    const role = this.user?.role;
    if (target === 'localization') {
      const destination = role === 'PATIENT' ? '/officiel/movement' : '/officiel/localizations';
      this.router.navigate([destination]);
      return;
    }

    const activityDestination = role === 'PATIENT' || role === 'CAREGIVER'
      ? '/officiel/quiz-list'
      : '/officiel/quiz-management';
    this.router.navigate([activityDestination]);
  }

  get interfaceTitle(): string {
    return this.activeInterface === 'localization'
      ? 'Interface Localisation'
      : 'Interface Activites Quiz';
  }

  get canGoLocalization(): boolean {
    const role = this.user?.role;
    return this.activeInterface === 'activity' && ['ADMIN', 'DOCTOR', 'PATIENT'].includes(role);
  }

  get canGoActivity(): boolean {
    const role = this.user?.role;
    return this.activeInterface === 'localization' && ['ADMIN', 'DOCTOR', 'PATIENT', 'CAREGIVER'].includes(role);
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/officiel']);
  }

  get initials(): string {
    if (!this.user) return '?';
    return (this.user.firstname?.[0] || '') + (this.user.lastname?.[0] || '');
  }

  get roleBadge(): string {
    const m: any = { ADMIN: '🛡️ Admin', DOCTOR: '🩺 Docteur', PATIENT: '🧠 Patient', CAREGIVER: '🤝 Aidant' };
    return m[this.user?.role] || this.user?.role;
  }
}
