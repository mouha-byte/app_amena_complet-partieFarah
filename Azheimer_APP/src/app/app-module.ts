import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
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

// Import des composants de gestion standalone
import { QuizManagementComponent } from './backoffice/quiz-management/quiz-management.component';
import { QaManagementComponent } from './backoffice/qa-management/qa-management.component';
import { PhotoManagementComponent } from './backoffice/photo-management/photo-management.component';
import { QuizListComponent } from './frontoffice/quiz-list/quiz-list.component';
import { QuizPlayerComponent } from './frontoffice/quiz-player/quiz-player.component';
import { TestPanelComponent } from './frontoffice/test-panel/test-panel.component';
import { LoginComponent } from './frontoffice/login/login.component';
import { RegisterComponent } from './frontoffice/register/register.component';
import { QuizService } from './services/quiz.service';
import { GameResultService } from './services/game-result.service';
import { AuthService } from './services/auth.service';

// Officiel standalone components
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
import { ForumPage } from './backoffice/forum-full/forum-page';
import { ForumPostsPage } from './backoffice/forum-full/forum-posts-page';
import { ForumPostDetailPage } from './backoffice/forum-full/forum-post-detail-page';
import { ForumAdminPage } from './backoffice/forum-full/forum-admin-page';
import { IncidentListPage } from './backoffice/incident-full/incident-list-page';
import { IncidentReportPage } from './backoffice/incident-full/incident-report-page';
import { IncidentHistoryPage } from './backoffice/incident-full/incident-history-page';
import { IncidentTypesPage } from './backoffice/incident-full/incident-types-page';
import { IncidentReportedPage } from './backoffice/incident-full/incident-reported-page';
import { PatientStatsPage } from './backoffice/incident-full/patient-stats-page';
import { IncidentCalendarPage } from './backoffice/incident-full/incident-calendar-page';

@NgModule({
  declarations: [
    App,
    Home1,
    Home2,
    Page404FrontPage,
    AboutFrontPage,
    AppointmentFrontPage,
    ContactFrontPage,
    DepartmentDetailsFrontPage,
    DepartmentsFrontPage,
    DoctorsFrontPage,
    FaqFrontPage,
    GalleryFrontPage,
    PrivacyFrontPage,
    ServiceDetailsFrontPage,
    ServicesFrontPage,
    StarterPageFrontPage,
    TermsFrontPage,
    TestimonialsFrontPage,
    ActivitiesPage,
    CalendarPage,
    ChatPage,
    CustomersPage,
    DealsPage,
    EmployeePage,
    FinancePage,
    ProfilePage,
    ReviewPage,
    SalesPage,
    SettingsPage,
    TaskManagementPage,
    TeamManagementPage,
    UserManagementPage
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,  // ✅ Ajouté pour ngModel
    ActivitiesFrontPage,
    ActivityExecuteComponent,
    ActivityHistoryComponent,
    QuizManagementComponent,
    QaManagementComponent,
    PhotoManagementComponent,
    QuizListComponent,
    QuizPlayerComponent,
    TestPanelComponent,
    LoginComponent,
    RegisterComponent,
    // Officiel standalone components
    OfficielLandingComponent,
    OfficielLoginComponent,
    OfficielRegisterComponent,
    LayoutComponent,
    DashboardComponent,
    OffQuizMgmt,
    OffPhotoMgmt,
    ResultsComponent,
    RiskAnalysisComponent,
    LocalizationManagementComponent,
    MovementMonitoringComponent,
    ForumDashboardComponent,
    IncidentDashboardComponent,
    ForumPage,
    ForumPostsPage,
    ForumPostDetailPage,
    ForumAdminPage,
    IncidentListPage,
    IncidentReportPage,
    IncidentHistoryPage,
    IncidentTypesPage,
    IncidentReportedPage,
    PatientStatsPage,
    IncidentCalendarPage,
    OffQuizList,
    OffQuizPlayer,
    OffUserMgmt
  ],
  providers: [provideBrowserGlobalErrorListeners(), QuizService, GameResultService, AuthService],
  bootstrap: [App],
})
export class AppModule { }