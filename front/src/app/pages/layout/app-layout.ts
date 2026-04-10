import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { filter } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
  group?: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-layout.html'
})
export class AppLayoutComponent implements OnInit {
  sidebarOpen = false;
  userName = '';
  userRole = '';
  unreadCount = 0;
  currentRoute = '';
  forumExpanded = false;
  othersExpanded = false;
  incidentsExpanded = false;

  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'fa-solid fa-chart-pie', route: '/dashboard', roles: ['ADMIN', 'DOCTOR', 'CAREGIVER', 'PATIENT'] },
    // Incident items — grouped
    { label: 'Incidents actifs', icon: 'fa-solid fa-triangle-exclamation', route: '/incidents', roles: ['ADMIN', 'DOCTOR', 'CAREGIVER', 'PATIENT'], group: 'incidents' },
    { label: 'Signaler incident', icon: 'fa-solid fa-plus-circle', route: '/incidents/report', roles: ['DOCTOR', 'CAREGIVER'], group: 'incidents' },
    { label: 'Historique', icon: 'fa-solid fa-clock-rotate-left', route: '/incidents/history', roles: ['ADMIN', 'DOCTOR', 'CAREGIVER', 'PATIENT'], group: 'incidents' },
    { label: 'Types d\'incident', icon: 'fa-solid fa-tags', route: '/incidents/types', roles: ['ADMIN'], group: 'incidents' },
    { label: 'Incidents signalés', icon: 'fa-solid fa-clipboard-list', route: '/incidents/reported', roles: ['ADMIN'], group: 'incidents' },
    { label: 'Stats patients', icon: 'fa-solid fa-chart-line', route: '/incidents/patient-stats', roles: ['ADMIN', 'DOCTOR'], group: 'incidents' },
    { label: 'Calendrier incidents', icon: 'fa-solid fa-calendar-check', route: '/incidents/calendar', roles: ['ADMIN', 'DOCTOR', 'CAREGIVER'], group: 'incidents' },
    // Non-incident items
    { label: 'Forum', icon: 'fa-solid fa-comments', route: '/forum', roles: ['ADMIN', 'DOCTOR', 'CAREGIVER', 'PATIENT'] },
    { label: 'Gestion Forum', icon: 'fa-solid fa-newspaper', route: '/forum/admin', roles: ['ADMIN'] },
    { label: 'Chatbot IA', icon: 'fa-solid fa-robot', route: '/chat', roles: ['ADMIN', 'DOCTOR', 'CAREGIVER', 'PATIENT'] },
    { label: 'Suivi humeur', icon: 'fa-solid fa-heart-pulse', route: '/mood', roles: ['ADMIN', 'PATIENT'] },
    { label: 'Calendrier', icon: 'fa-solid fa-calendar-days', route: '/calendar', roles: ['ADMIN', 'DOCTOR', 'CAREGIVER'] },
    { label: 'Utilisateurs', icon: 'fa-solid fa-users-gear', route: '/users', roles: ['ADMIN'] },
  ];

  filteredNav: NavItem[] = [];
  mainNav: NavItem[] = [];
  forumNav: NavItem[] = [];
  otherNav: NavItem[] = [];
  dashboardNav: NavItem | null = null;
  otherRestNav: NavItem[] = [];
  incidentNav: NavItem[] = [];

  constructor(
    private authService: AuthService,
    private notifService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getFullName() || 'Utilisateur';
    this.userRole = this.authService.getRole();
    this.currentRoute = this.router.url;

    this.filteredNav = this.navItems.filter(item => item.roles.includes(this.userRole));
    this.mainNav = this.filteredNav.filter(item => !item.group);
    this.forumNav = this.mainNav.filter(item => item.route.startsWith('/forum'));
    this.otherNav = this.mainNav.filter(item => !item.route.startsWith('/forum'));
    this.dashboardNav = this.otherNav.find(item => item.route === '/dashboard') || null;
    this.otherRestNav = this.otherNav.filter(item => item.route !== '/dashboard');
    this.incidentNav = this.filteredNav.filter(item => item.group === 'incidents');

    // Auto-expand sections depending on current route
    this.forumExpanded = this.currentRoute.includes('/forum');
    this.othersExpanded = !this.forumExpanded;
    this.incidentsExpanded = this.router.url.includes('/incidents');

    const userId = this.authService.getUserId();
    if (userId) {
      this.notifService.getUnreadCount(userId).subscribe(c => this.unreadCount = c.count);
    }

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e) => {
      this.currentRoute = (e as NavigationEnd).urlAfterRedirects;
      if (this.currentRoute.includes('/forum')) {
        this.forumExpanded = true;
        this.othersExpanded = false;
      } else if (this.isAnyOtherActive()) {
        this.othersExpanded = true;
      }
      // Auto-expand incidents section when navigating to incident pages
      if (this.currentRoute.includes('/incidents')) {
        this.incidentsExpanded = true;
      }
    });
  }

  isActive(route: string): boolean {
    if (route === '/dashboard') return this.currentRoute === '/dashboard';
    return this.currentRoute.startsWith(route);
  }

  isAnyIncidentActive(): boolean {
    return this.currentRoute.includes('/incidents');
  }

  isAnyForumActive(): boolean {
    return this.currentRoute.includes('/forum');
  }

  isAnyOtherActive(): boolean {
    const routes = [
      ...this.otherNav.map(item => item.route),
      ...this.incidentNav.map(item => item.route),
    ];
    return routes.some(route => this.currentRoute.startsWith(route));
  }

  toggleForum(): void {
    this.forumExpanded = !this.forumExpanded;
    if (this.forumExpanded) {
      this.othersExpanded = false;
    }
  }

  toggleOthers(): void {
    this.othersExpanded = !this.othersExpanded;
    if (this.othersExpanded) {
      this.forumExpanded = false;
    }
  }

  toggleIncidents(): void {
    this.incidentsExpanded = !this.incidentsExpanded;
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleBadgeClass(): string {
    switch (this.userRole) {
      case 'ADMIN': return 'background:#dbeafe;color:#1d4ed8';
      case 'DOCTOR': return 'background:#d1fae5;color:#059669';
      case 'CAREGIVER': return 'background:#fef3c7;color:#b45309';
      case 'PATIENT': return 'background:#ede9fe;color:#7c3aed';
      default: return 'background:#f1f5f9;color:#64748b';
    }
  }

  getRoleLabel(): string {
    switch (this.userRole) {
      case 'ADMIN': return 'Administrateur';
      case 'DOCTOR': return 'Médecin';
      case 'CAREGIVER': return 'Aidant';
      case 'PATIENT': return 'Patient';
      default: return this.userRole;
    }
  }
}
