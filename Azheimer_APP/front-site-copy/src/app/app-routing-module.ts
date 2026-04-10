import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';

import { LoginPage } from './pages/auth/login-page';
import { RegisterPage } from './pages/auth/register-page';
import { AppLayoutComponent } from './pages/layout/app-layout';
import { DashboardPage } from './pages/dashboard/dashboard-page';
import { IncidentListPage } from './pages/incidents/incident-list-page';
import { IncidentReportPage } from './pages/incidents/incident-report-page';
import { IncidentHistoryPage } from './pages/incidents/incident-history-page';
import { IncidentTypesPage } from './pages/incidents/incident-types-page';
import { IncidentReportedPage } from './pages/incidents/incident-reported-page';
import { PatientStatsPage } from './pages/incidents/patient-stats-page';
import { IncidentCalendarPage } from './pages/incidents/incident-calendar-page';
import { ForumPage } from './pages/forum/forum-page';
import { ForumPostsPage } from './pages/forum/forum-posts-page';
import { ForumPostDetailPage } from './pages/forum/forum-post-detail-page';
import { ForumAdminPage } from './pages/forum/forum-admin-page';
import { ChatPage } from './pages/chat/chat-page';
import { MoodPage } from './pages/mood/mood-page';
import { CalendarPage } from './pages/calendar/calendar-page';
import { UsersPage } from './pages/users/users-page';
import { ProfilePage } from './pages/profile/profile-page';

const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },

  // Backoffice routes — only for DOCTOR / ADMIN
  {
    path: '',
    component: AppLayoutComponent,
    canMatch: [() => {
      const auth = inject(AuthService);
      return auth.isLoggedIn() && ['DOCTOR', 'ADMIN'].includes(auth.getRole());
    }],
    children: [
      { path: 'dashboard', component: DashboardPage },
      { path: 'incidents', component: IncidentListPage },
      { path: 'incidents/report', component: IncidentReportPage },
      { path: 'incidents/history', component: IncidentHistoryPage },
      { path: 'incidents/types', component: IncidentTypesPage, canActivate: [adminGuard] },
      { path: 'incidents/reported', component: IncidentReportedPage, canActivate: [adminGuard] },
      { path: 'incidents/patient-stats', component: PatientStatsPage },
      { path: 'incidents/calendar', component: IncidentCalendarPage },
      { path: 'forum', component: ForumPage },
      { path: 'forum/category/:id', component: ForumPostsPage },
      { path: 'forum/post/:id', component: ForumPostDetailPage },
      { path: 'forum/admin', component: ForumAdminPage, canActivate: [adminGuard] },
      { path: 'chat', component: ChatPage },
      { path: 'mood', component: MoodPage },
      { path: 'calendar', component: CalendarPage },
      { path: 'users', component: UsersPage, canActivate: [adminGuard] },
      { path: 'profile', component: ProfilePage },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Backoffice module — full admin panel at /admin
  {
    path: 'admin',
    canMatch: [() => {
      const auth = inject(AuthService);
      return auth.isLoggedIn() && ['DOCTOR', 'ADMIN'].includes(auth.getRole());
    }],
    loadChildren: () =>
      import('./backoffice/backoffice-module').then((m) => m.BackofficeModule),
  },

  // Landing page (public) — loaded from frontoffice module
  {
    path: '',
    loadChildren: () =>
      import('./frontoffice/frontoffice-module').then((m) => m.FrontofficeModule),
  },

  // Fallback
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
