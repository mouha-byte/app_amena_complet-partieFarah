import { Component } from '@angular/core';

@Component({
    selector: 'app-frontoffice-layout',
    template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
    standalone: false
})
export class FrontofficeLayoutComponent { }
