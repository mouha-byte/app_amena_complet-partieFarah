import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../../services/auth.service';

type WorkspaceMode = 'dashboard' | 'localization' | 'activity' | 'forum' | 'incident';
type WorkspaceSection =
  | 'localizations'
  | 'movement'
  | 'quiz'
  | 'photo'
  | 'myquiz'
  | 'results'
  | 'users'
  | 'forum-home'
  | 'forum-posts'
  | 'forum-post-detail'
  | 'forum-admin'
  | 'incident-list'
  | 'incident-report'
  | 'incident-history'
  | 'incident-types'
  | 'incident-reported'
  | 'incident-stats'
  | 'incident-calendar';

@Component({
  selector: 'app-home2',
  standalone: false,
  templateUrl: './home2.html',
  styleUrls: ['./home2.css'],
})
export class Home2 implements OnInit {
  user: AuthUser | null = null;
  activeWorkspace: WorkspaceMode = 'dashboard';
  activeSection: WorkspaceSection = 'quiz';
  forumCategoryId: number | null = null;
  forumPostId: number | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    if (!this.user) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/admin' } });
      return;
    }
    this.ensureWorkspaceAllowed();
  }

  showDashboard(): void {
    this.activeWorkspace = 'dashboard';
  }

  openLocalization(section: 'localizations' | 'movement' = 'localizations'): void {
    if (!this.canAccessLocalizationWorkspace) {
      this.showDashboard();
      return;
    }
    if (section === 'localizations' && !this.canManageLocalizations) {
      section = 'movement';
    }
    if (section === 'movement' && !this.canTrackMovement) {
      this.showDashboard();
      return;
    }
    this.activeWorkspace = 'localization';
    this.activeSection = section;
  }

  openActivity(section: 'quiz' | 'photo' | 'myquiz' | 'results' | 'users' = 'quiz'): void {
    if (!this.canAccessActivityWorkspace) {
      this.showDashboard();
      return;
    }
    if (!this.isActivitySectionAllowed(section)) {
      const fallback = this.firstAllowedActivitySection();
      if (!fallback) {
        this.showDashboard();
        return;
      }
      section = fallback;
    }
    this.activeWorkspace = 'activity';
    this.activeSection = section;
  }

  openForum(section: 'forum-home' | 'forum-admin' = 'forum-home'): void {
    if (!this.canAccessForumDashboard) {
      this.showDashboard();
      return;
    }

    if (section === 'forum-admin' && !this.canManageForum) {
      section = 'forum-home';
    }

    this.activeWorkspace = 'forum';
    this.activeSection = section;

    if (section === 'forum-home') {
      this.forumCategoryId = null;
      this.forumPostId = null;
    }
  }

  openForumCategory(categoryId: number): void {
    if (!this.canAccessForumDashboard) {
      return;
    }
    this.activeWorkspace = 'forum';
    this.activeSection = 'forum-posts';
    this.forumCategoryId = categoryId;
    this.forumPostId = null;
  }

  openForumPost(postId: number): void {
    if (!this.canAccessForumDashboard) {
      return;
    }
    this.activeWorkspace = 'forum';
    this.activeSection = 'forum-post-detail';
    this.forumPostId = postId;
  }

  backToForumPosts(): void {
    if (!this.forumCategoryId) {
      this.openForum('forum-home');
      return;
    }
    this.activeWorkspace = 'forum';
    this.activeSection = 'forum-posts';
  }

  openIncident(
    section:
      | 'incident-list'
      | 'incident-report'
      | 'incident-history'
      | 'incident-types'
      | 'incident-reported'
      | 'incident-stats'
      | 'incident-calendar' = 'incident-list'
  ): void {
    if (!this.canAccessIncidentDashboard) {
      this.showDashboard();
      return;
    }

    if (!this.isIncidentSectionAllowed(section)) {
      section = this.firstAllowedIncidentSection();
    }

    this.activeWorkspace = 'incident';
    this.activeSection = section;
  }

  get userDisplayName(): string {
    if (!this.user) return 'Utilisateur';
    return `${this.user.firstname} ${this.user.lastname}`.trim();
  }

  get userEmail(): string {
    return this.user?.email || '';
  }

  get roleLabel(): string {
    const role = this.user?.role;
    if (role === 'ADMIN') return 'Admin';
    if (role === 'DOCTOR') return 'Docteur';
    if (role === 'PATIENT') return 'Patient';
    if (role === 'CAREGIVER') return 'Aidant';
    return role || 'Invité';
  }

  get canAccessLocalizationWorkspace(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR', 'PATIENT']);
  }

  get canAccessActivityWorkspace(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR', 'PATIENT', 'CAREGIVER']);
  }

  get canManageLocalizations(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR']);
  }

  get canTrackMovement(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR', 'PATIENT']);
  }

  get canManageQuiz(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR']);
  }

  get canManagePhoto(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR']);
  }

  get canViewResults(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR', 'PATIENT']);
  }

  get canAccessMyQuiz(): boolean {
    return this.hasAnyRole(['PATIENT', 'CAREGIVER']);
  }

  get canManageUsers(): boolean {
    return this.hasAnyRole(['ADMIN']);
  }

  get canAccessForumDashboard(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR', 'PATIENT', 'CAREGIVER']);
  }

  get canManageForum(): boolean {
    return this.hasAnyRole(['ADMIN']);
  }

  get canAccessIncidentDashboard(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR', 'PATIENT', 'CAREGIVER']);
  }

  get canReportIncident(): boolean {
    return this.hasAnyRole(['DOCTOR', 'CAREGIVER']);
  }

  get canViewIncidentHistory(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR', 'PATIENT', 'CAREGIVER']);
  }

  get canManageIncidentTypes(): boolean {
    return this.hasAnyRole(['ADMIN']);
  }

  get canViewReportedIncidents(): boolean {
    return this.hasAnyRole(['ADMIN']);
  }

  get canViewPatientStats(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR']);
  }

  get canViewIncidentCalendar(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR', 'CAREGIVER']);
  }

  get canDisplayCurrentSection(): boolean {
    if (this.activeWorkspace === 'dashboard') return true;
    if (this.activeWorkspace === 'localization') {
      return this.activeSection === 'localizations' ? this.canManageLocalizations : this.canTrackMovement;
    }
    if (this.activeWorkspace === 'forum') {
      if (this.activeSection === 'forum-admin') return this.canManageForum;
      return this.canAccessForumDashboard;
    }
    if (this.activeWorkspace === 'incident') {
      return this.isIncidentSectionAllowed(this.activeSection);
    }
    return this.isActivitySectionAllowed(this.activeSection);
  }

  get currentPageTitle(): string {
    if (this.activeWorkspace === 'localization') {
      return this.activeSection === 'movement' ? 'Suivi Patient' : 'Localisation';
    }
    if (this.activeWorkspace === 'activity') {
      if (this.activeSection === 'photo') return 'Photo Management';
      if (this.activeSection === 'myquiz') return 'Mes Quiz';
      if (this.activeSection === 'results') return 'Resultats & Risque';
      if (this.activeSection === 'users') return 'Utilisateurs';
      return 'Quiz Management';
    }
    if (this.activeWorkspace === 'forum') {
      if (this.activeSection === 'forum-admin') return 'Gestion Forum';
      if (this.activeSection === 'forum-post-detail') return 'Detail Publication';
      if (this.activeSection === 'forum-posts') return 'Publications Categorie';
      return 'Forum Communautaire';
    }
    if (this.activeWorkspace === 'incident') {
      if (this.activeSection === 'incident-report') return 'Signaler Incident';
      if (this.activeSection === 'incident-history') return 'Historique Incidents';
      if (this.activeSection === 'incident-types') return 'Types d\'Incident';
      if (this.activeSection === 'incident-reported') return 'Incidents Signales';
      if (this.activeSection === 'incident-stats') return 'Statistiques Patients';
      if (this.activeSection === 'incident-calendar') return 'Calendrier Incidents';
      return 'Incidents Actifs';
    }
    return 'Dashboard';
  }

  private hasAnyRole(roles: string[]): boolean {
    const role = this.user?.role;
    return !!role && roles.includes(role);
  }

  private isActivitySectionAllowed(section: WorkspaceSection): boolean {
    if (section === 'quiz') return this.canManageQuiz;
    if (section === 'photo') return this.canManagePhoto;
    if (section === 'myquiz') return this.canAccessMyQuiz;
    if (section === 'results') return this.canViewResults;
    if (section === 'users') return this.canManageUsers;
    return false;
  }

  private isIncidentSectionAllowed(section: WorkspaceSection): boolean {
    if (section === 'incident-list') return this.canAccessIncidentDashboard;
    if (section === 'incident-report') return this.canReportIncident;
    if (section === 'incident-history') return this.canViewIncidentHistory;
    if (section === 'incident-types') return this.canManageIncidentTypes;
    if (section === 'incident-reported') return this.canViewReportedIncidents;
    if (section === 'incident-stats') return this.canViewPatientStats;
    if (section === 'incident-calendar') return this.canViewIncidentCalendar;
    return false;
  }

  private firstAllowedIncidentSection():
    | 'incident-list'
    | 'incident-report'
    | 'incident-history'
    | 'incident-types'
    | 'incident-reported'
    | 'incident-stats'
    | 'incident-calendar' {
    if (this.canAccessIncidentDashboard) return 'incident-list';
    if (this.canReportIncident) return 'incident-report';
    if (this.canViewIncidentHistory) return 'incident-history';
    if (this.canManageIncidentTypes) return 'incident-types';
    if (this.canViewReportedIncidents) return 'incident-reported';
    if (this.canViewPatientStats) return 'incident-stats';
    return 'incident-calendar';
  }

  private firstAllowedActivitySection(): 'quiz' | 'photo' | 'myquiz' | 'results' | 'users' | null {
    if (this.canManageQuiz) return 'quiz';
    if (this.canManagePhoto) return 'photo';
    if (this.canAccessMyQuiz) return 'myquiz';
    if (this.canViewResults) return 'results';
    if (this.canManageUsers) return 'users';
    return null;
  }

  private ensureWorkspaceAllowed(): void {
    if (!this.canAccessLocalizationWorkspace && this.activeWorkspace === 'localization') {
      this.showDashboard();
      return;
    }
    if (!this.canAccessActivityWorkspace && this.activeWorkspace === 'activity') {
      this.showDashboard();
      return;
    }
    if (!this.canAccessForumDashboard && this.activeWorkspace === 'forum') {
      this.showDashboard();
      return;
    }
    if (!this.canAccessIncidentDashboard && this.activeWorkspace === 'incident') {
      this.showDashboard();
      return;
    }
    if (this.activeWorkspace === 'forum' && this.activeSection === 'forum-admin' && !this.canManageForum) {
      this.openForum('forum-home');
      return;
    }
    if (this.activeWorkspace === 'incident' && !this.isIncidentSectionAllowed(this.activeSection)) {
      this.activeSection = this.firstAllowedIncidentSection();
      return;
    }
    if (this.activeWorkspace === 'activity' && !this.isActivitySectionAllowed(this.activeSection)) {
      const fallback = this.firstAllowedActivitySection();
      if (fallback) {
        this.activeSection = fallback;
      } else {
        this.showDashboard();
      }
      return;
    }
    if (this.activeWorkspace === 'localization' && this.activeSection === 'localizations' && !this.canManageLocalizations) {
      this.activeSection = 'movement';
      if (!this.canTrackMovement) {
        this.showDashboard();
      }
    }
  }
}
