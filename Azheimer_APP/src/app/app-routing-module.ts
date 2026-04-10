import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home1 } from './frontoffice/home1/home1';
import { Home2 } from './backoffice/home2/home2';
import { Page404FrontPage } from './frontoffice/404/404';
import { AboutFrontPage } from './frontoffice/about/about';
import { AppointmentFrontPage } from './frontoffice/appointment/appointment';
import { ContactFrontPage } from './frontoffice/contact/contact';
import { DepartmentDetailsFrontPage } from './frontoffice/department-details/department-details';
import { DepartmentsFrontPage } from './frontoffice/departments/departments';
import { DoctorsFrontPage } from './frontoffice/doctors/doctors';
import { FaqFrontPage } from './frontoffice/faq/faq';
import { GalleryFrontPage } from './frontoffice/gallery/gallery';
import { PrivacyFrontPage } from './frontoffice/privacy/privacy';
import { ServiceDetailsFrontPage } from './frontoffice/service-details/service-details';
import { ServicesFrontPage } from './frontoffice/services/services';
import { StarterPageFrontPage } from './frontoffice/starter-page/starter-page';
import { TermsFrontPage } from './frontoffice/terms/terms';
import { TestimonialsFrontPage } from './frontoffice/testimonials/testimonials';
import { ActivitiesPage } from './backoffice/activities/activities';
import { CalendarPage } from './backoffice/calendar/calendar';
import { ChatPage } from './backoffice/chat/chat';
import { CustomersPage } from './backoffice/customers/customers';
import { DealsPage } from './backoffice/deals/deals';
import { EmployeePage } from './backoffice/employee/employee';
import { FinancePage } from './backoffice/finance/finance';
import { ProfilePage } from './backoffice/profile/profile';
import { ReviewPage } from './backoffice/review/review';
import { SalesPage } from './backoffice/sales/sales';
import { SettingsPage } from './backoffice/settings/settings';
import { TaskManagementPage } from './backoffice/task-management/task-management';
import { TeamManagementPage } from './backoffice/team-management/team-management';
import { UserManagementPage } from './backoffice/user-management/user-management';
import { ActivitiesFrontPage } from './frontoffice/activities/activities.component';
import { ActivityExecuteComponent } from './frontoffice/activities/activity-execute/activity-execute.component';
import { ActivityHistoryComponent } from './frontoffice/activities/activity-history/activity-history.component';
import { QuizManagementComponent } from './backoffice/quiz-management/quiz-management.component';
import { PhotoManagementComponent } from './backoffice/photo-management/photo-management.component';
import { QaManagementComponent } from './backoffice/qa-management/qa-management.component';
import { QuizListComponent } from './frontoffice/quiz-list/quiz-list.component';
import { QuizPlayerComponent } from './frontoffice/quiz-player/quiz-player.component';
import { TestPanelComponent } from './frontoffice/test-panel/test-panel.component';
import { LoginComponent } from './frontoffice/login/login.component';
import { RegisterComponent } from './frontoffice/register/register.component';
import { AuthGuard } from './guards/auth.guard';

// Officiel components
import { OfficielLandingComponent } from './officiel/landing/landing.component';
import { OfficielLoginComponent } from './officiel/auth/login/login.component';
import { OfficielRegisterComponent } from './officiel/auth/register/register.component';
import { LayoutComponent } from './officiel/layout/layout.component';
import { DashboardComponent } from './officiel/dashboard/dashboard.component';
import { QuizManagementComponent as OffQuizMgmt } from './officiel/quiz-management/quiz-management.component';
import { PhotoManagementComponent as OffPhotoMgmt } from './officiel/photo-management/photo-management.component';
import { ResultsComponent } from './officiel/results/results.component';
import { RiskAnalysisComponent } from './officiel/risk-analysis/risk-analysis.component';
import { QuizListComponent as OffQuizList } from './officiel/quiz-list/quiz-list.component';
import { QuizPlayerComponent as OffQuizPlayer } from './officiel/quiz-player/quiz-player.component';
import { UserManagementComponent as OffUserMgmt } from './officiel/user-management/user-management.component';
import { LocalizationManagementComponent } from './officiel/localization-management/localization-management.component';
import { MovementMonitoringComponent } from './officiel/movement-monitoring/movement-monitoring.component';
import { ForumDashboardComponent } from './backoffice/forum-dashboard/forum-dashboard.component';
import { IncidentDashboardComponent } from './backoffice/incident-dashboard/incident-dashboard.component';

const routes: Routes = [
  { path: '', component: Home1 },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '404', component: Page404FrontPage },
  { path: 'about', component: AboutFrontPage },
  { path: 'appointment', component: AppointmentFrontPage },
  { path: 'contact', component: ContactFrontPage },
  { path: 'department-details', component: DepartmentDetailsFrontPage },
  { path: 'departments', component: DepartmentsFrontPage },
  { path: 'doctors', component: DoctorsFrontPage },
  { path: 'faq', component: FaqFrontPage },
  { path: 'gallery', component: GalleryFrontPage },
  { path: 'privacy', component: PrivacyFrontPage },
  { path: 'service-details', component: ServiceDetailsFrontPage },
  { path: 'services', component: ServicesFrontPage },
  { path: 'starter-page', component: StarterPageFrontPage },
  { path: 'terms', component: TermsFrontPage },
  { path: 'testimonials', component: TestimonialsFrontPage },
  { path: 'testimonials', component: TestimonialsFrontPage },
  { path: 'activities', component: ActivitiesFrontPage },
  { path: 'activities/history', component: ActivityHistoryComponent },
  { path: 'activities/execute/:id', component: ActivityExecuteComponent },
  { path: 'quiz', component: QuizListComponent },
  { path: 'quiz/player/:id', component: QuizPlayerComponent },
  { path: 'test', component: TestPanelComponent },
  { path: 'admin', component: Home2, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'CAREGIVER'] } },
  { path: 'admin/activities', component: ActivitiesPage, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'DOCTOR'] } },
  { path: 'admin/calendar', component: CalendarPage, canActivate: [AuthGuard] },
  { path: 'admin/chat', component: ChatPage, canActivate: [AuthGuard] },
  { path: 'admin/customers', component: CustomersPage, canActivate: [AuthGuard] },
  { path: 'admin/deals', component: DealsPage, canActivate: [AuthGuard] },
  { path: 'admin/employee', component: EmployeePage, canActivate: [AuthGuard] },
  { path: 'admin/finance', component: FinancePage, canActivate: [AuthGuard] },
  { path: 'admin/profile', component: ProfilePage, canActivate: [AuthGuard] },
  { path: 'admin/review', component: ReviewPage, canActivate: [AuthGuard] },
  { path: 'admin/sales', component: SalesPage, canActivate: [AuthGuard] },
  { path: 'admin/settings', component: SettingsPage, canActivate: [AuthGuard] },
  { path: 'admin/quiz-management', component: QuizManagementComponent, canActivate: [AuthGuard] },
  { path: 'admin/photo-management', component: PhotoManagementComponent, canActivate: [AuthGuard] },
  { path: 'admin/qa-management', component: QaManagementComponent, canActivate: [AuthGuard] },
  { path: 'admin/forum/dashboard', component: ForumDashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'CAREGIVER'] } },
  { path: 'admin/incident/dashboard', component: IncidentDashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'CAREGIVER'] } },
  { path: 'admin/task-management', component: TaskManagementPage, canActivate: [AuthGuard] },
  { path: 'admin/team-management', component: TeamManagementPage, canActivate: [AuthGuard] },
  { path: 'admin/user-management', component: UserManagementPage, canActivate: [AuthGuard] },

  // App2 route (front-site-copy removed)
  {
    path: 'app2',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'CAREGIVER'] },
    component: Home2,
  },

  // === OFFICIEL ===
  { path: 'officiel', component: OfficielLandingComponent },
  { path: 'officiel/login', component: OfficielLoginComponent },
  { path: 'officiel/register', component: OfficielRegisterComponent },
  {
    path: 'officiel', component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'quiz-management', component: OffQuizMgmt, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'DOCTOR'] } },
      { path: 'photo-management', component: OffPhotoMgmt, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'DOCTOR'] } },
      { path: 'results', component: ResultsComponent },
      { path: 'risk-analysis', component: RiskAnalysisComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'DOCTOR'] } },
      { path: 'localizations', component: LocalizationManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'DOCTOR'] } },
      { path: 'movement', component: MovementMonitoringComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'DOCTOR', 'PATIENT'] } },
      { path: 'quiz-list', component: OffQuizList },
      { path: 'play/:type/:id', component: OffQuizPlayer },
      { path: 'users', component: OffUserMgmt, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
    ]
  },

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
