import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Home2 } from './home2/home2';
import { ActivitiesPage } from './activities/activities';
import { CalendarPage } from './calendar/calendar';
import { ChatPage } from './chat/chat';
import { CustomersPage } from './customers/customers';
import { DealsPage } from './deals/deals';
import { EmployeePage } from './employee/employee';
import { FinancePage } from './finance/finance';
import { ProfilePage } from './profile/profile';
import { ReviewPage } from './review/review';
import { SalesPage } from './sales/sales';
import { SettingsPage } from './settings/settings';
import { TaskManagementPage } from './task-management/task-management';
import { TeamManagementPage } from './team-management/team-management';
import { UserManagementPage } from './user-management/user-management';
import { AdminDashboard } from './forum-admin/admin-dashboard/admin-dashboard';
import { PostList } from './forum-admin/post-list/post-list';
import { CommentList } from './forum-admin/comment-list/comment-list';

import { BackofficeLayoutComponent } from './backoffice-layout/backoffice-layout';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home';
import { MoodTrackerComponent } from './mood-tracker/mood-tracker';

// Lazy load categories module
const categoriesRoutes = () => import('./forum-admin/categories/categories.module').then(m => m.CategoriesModule);

const routes: Routes = [
  {
    path: '',
    component: BackofficeLayoutComponent,
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'activities', component: ActivitiesPage },
      { path: 'calendar', component: CalendarPage },
      { path: 'chat', component: ChatPage },
      { path: 'mood-tracker', component: MoodTrackerComponent },
      { path: 'customers', component: CustomersPage },
      { path: 'deals', component: DealsPage },
      { path: 'employee', component: EmployeePage },
      { path: 'finance', component: FinancePage },
      { path: 'profile', component: ProfilePage },
      { path: 'review', component: ReviewPage },
      { path: 'sales', component: SalesPage },
      { path: 'settings', component: SettingsPage },
      { path: 'task-management', component: TaskManagementPage },
      { path: 'team-management', component: TeamManagementPage },
      { path: 'user-management', component: UserManagementPage },
      { path: 'forum', component: AdminDashboard },
      { path: 'forum/posts', component: PostList },
      { path: 'forum/ListPost', component: PostList },
      { path: 'forum/comments', component: CommentList, title: 'Forum Comments' },
      { path: 'forum/banned', component: CommentList, title: 'Banned Comments', data: { tab: 'banned' } },
      {
        path: 'forum/categories',
        loadChildren: categoriesRoutes,
        title: 'Forum Categories'
      },
      {
        path: 'incidents',
        loadChildren: () => import('./incident-management/incident-management.module').then(m => m.IncidentManagementModule),
        title: 'Incident Management'
      },
      {
        path: 'incidents-reported',
        loadChildren: () => import('./incidents-backoffice/incidents-backoffice.module').then(m => m.IncidentsBackofficeModule),
        title: 'Incidents Signalés'
      },
      {
        path: 'incident-types',
        loadChildren: () => import('./incident-management/incident-management.module').then(m => m.IncidentManagementModule),
        title: 'Types d\'Incidents'
      },
      {
        path: 'incident-history',
        loadChildren: () => import('./incident-management/incident-management.module').then(m => m.IncidentManagementModule),
        title: 'Historique des Incidents'
      },
    ]
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BackofficeRoutingModule { }
