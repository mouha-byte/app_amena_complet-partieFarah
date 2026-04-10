import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home1',
  standalone: false,
  templateUrl: './home1.html',
  styleUrls: ['./home1.css'],
})
export class Home1 {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
