import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService, AppNotification } from '../../core/services/notification.service';

@Component({
  selector: 'app-backoffice-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class BackofficeHeader implements OnInit, OnDestroy {
  unreadCount = 0;
  notifications: AppNotification[] = [];
  showDropdown = false;
  private sub!: Subscription;

  constructor(
    public authService: AuthService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notifService.startPolling(userId);
      this.sub = this.notifService.unreadCount.subscribe(c => this.unreadCount = c);
      this.loadNotifications(userId);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadNotifications(userId: number): void {
    this.notifService.getByUser(userId).subscribe({
      next: data => { this.notifications = data.slice(0, 8); },
      error: () => {}
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      const userId = this.authService.getUserId();
      if (userId) this.loadNotifications(userId);
    }
  }

  markAllRead(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.notifService.markAllRead(userId).subscribe(() => {
      this.unreadCount = 0;
      this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    });
  }

  markRead(notif: AppNotification): void {
    if (notif.read || !notif.id) return;
    this.notifService.markRead(notif.id).subscribe(() => {
      notif.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    });
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      INFO: 'ri-information-line text-info',
      WARNING: 'ri-error-warning-line text-warning',
      CRITICAL: 'ri-alarm-warning-line text-danger'
    };
    return icons[type] || 'ri-notification-3-line text-secondary';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-dropdown-wrapper')) {
      this.showDropdown = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
