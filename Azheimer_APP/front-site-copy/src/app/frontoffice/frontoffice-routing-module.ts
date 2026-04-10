import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

import { Home1 } from './home1/home1';
import { AboutFrontPage } from './about/about';
import { AppointmentFrontPage } from './appointment/appointment';
import { ContactFrontPage } from './contact/contact';
import { DepartmentDetailsFrontPage } from './department-details/department-details';
import { DepartmentsFrontPage } from './departments/departments';
import { DoctorsFrontPage } from './doctors/doctors';
import { FaqFrontPage } from './faq/faq';
import { GalleryFrontPage } from './gallery/gallery';
import { PrivacyFrontPage } from './privacy/privacy';
import { ServiceDetailsFrontPage } from './service-details/service-details';
import { ServicesFrontPage } from './services/services';
import { StarterPageFrontPage } from './starter-page/starter-page';
import { TermsFrontPage } from './terms/terms';
import { TestimonialsFrontPage } from './testimonials/testimonials';
import { FrontofficeLayoutComponent } from './frontoffice-layout';

const routes: Routes = [
  {
    path: '',
    component: FrontofficeLayoutComponent,
    children: [
      { path: '', component: Home1, pathMatch: 'full' },
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
      {
        path: 'incidents',
        canActivate: [authGuard],
        loadChildren: () => import('./incidents-front.module').then(m => m.IncidentsFrontModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FrontofficeRoutingModule { }
