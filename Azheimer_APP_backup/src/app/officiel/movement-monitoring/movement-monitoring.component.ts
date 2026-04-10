import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AppUser, LocationPing, MovementAlert, MovementService } from '../../services/movement.service';

@Component({
  selector: 'app-movement-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movement-monitoring.component.html',
  styleUrls: ['./movement-monitoring.component.css']
})
export class MovementMonitoringComponent implements OnInit, OnDestroy {
  user: any;
  patients: AppUser[] = [];
  selectedPatientId = 0;
  sendingWhatsappAlertId: number | null = null;

  latestLocation: LocationPing | null = null;
  history: LocationPing[] = [];
  alerts: MovementAlert[] = [];

  loading = false;
  reporting = false;
  pollRef: any;

  backendOffline = false;
  offlineReason = '';
  consecutiveApiErrors = 0;
  readonly maxApiErrorsBeforePause = 2;
  lastSuccessfulSyncAt: Date | null = null;

  msg = '';
  msgType: 'info' | 'warn' | 'err' = 'info';

  constructor(
    private auth: AuthService,
    private movement: MovementService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    if (!this.user) {
      this.router.navigate(['/officiel/login']);
      return;
    }

    if (this.isAdminOrDoctor) {
      this.movement.getPatients().subscribe({
        next: (patients) => {
          this.patients = patients || [];
          this.selectedPatientId = this.patients[0]?.id || 0;
          if (!this.selectedPatientId) {
            this.showMsg('Aucun patient disponible pour le suivi.');
            this.loading = false;
            this.refreshView();
            return;
          }
          this.refresh();
          this.startPolling();
          this.refreshView();
        },
        error: () => {
          this.showMsg('Impossible de charger la liste des patients.');
          this.loading = false;
          this.refreshView();
        }
      });
      return;
    }

    this.initializePatientView();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get isAdminOrDoctor(): boolean {
    const role = this.user?.role;
    return role === 'ADMIN' || role === 'DOCTOR';
  }

  get isPatient(): boolean {
    return this.user?.role === 'PATIENT';
  }

  get mapLink(): string {
    if (!this.latestLocation) return '';
    const la = this.latestLocation.latitude;
    const lo = this.latestLocation.longitude;
    return `https://www.openstreetmap.org/?mlat=${la}&mlon=${lo}#map=16/${la}/${lo}`;
  }

  onPatientChange(): void {
    this.refresh();
  }

  refresh(): void {
    if (!this.selectedPatientId) return;
    this.loading = true;
    this.refreshView();

    const latest$ = this.movement.getLatestLocation(this.selectedPatientId)
      .pipe(
        map((data) => ({ data, failed: false, error: null as any })),
        catchError((error) => of({ data: null as LocationPing | null, failed: true, error }))
      );

    const history$ = this.movement.getLocationHistory(this.selectedPatientId, 240)
      .pipe(
        map((data) => ({ data, failed: false, error: null as any })),
        catchError((error) => of({ data: [] as LocationPing[], failed: true, error }))
      );

    const alerts$ = (this.isAdminOrDoctor
      ? this.movement.getAlerts(true)
      : this.movement.getPatientAlerts(this.selectedPatientId))
      .pipe(
        map((data) => ({ data, failed: false, error: null as any })),
        catchError((error) => of({ data: [] as MovementAlert[], failed: true, error }))
      );

    forkJoin({ latest: latest$, history: history$, alerts: alerts$ }).subscribe({
      next: ({ latest, history, alerts }) => {
        const failedErrors = [latest, history, alerts]
          .filter((x) => x.failed)
          .map((x) => x.error);

        if (!latest.failed) {
          this.latestLocation = latest.data;
        }
        if (!history.failed) {
          this.history = (history.data || []).slice().reverse();
        }
        if (!alerts.failed) {
          this.alerts = alerts.data || [];
        }

        if (failedErrors.length === 0) {
          this.consecutiveApiErrors = 0;
          this.backendOffline = false;
          this.offlineReason = '';
          this.lastSuccessfulSyncAt = new Date();
          if (!this.pollRef) {
            this.startPolling();
          }
        } else {
          this.consecutiveApiErrors += 1;
          if (this.consecutiveApiErrors >= this.maxApiErrorsBeforePause) {
            this.backendOffline = true;
            this.offlineReason = this.formatNetworkReason(failedErrors[0]);
            this.stopPolling();
            this.showMsg(this.offlineReason, 'warn');
          }
        }

        this.loading = false;
        this.refreshView();
      },
      error: () => {
        this.consecutiveApiErrors += 1;
        this.backendOffline = true;
        this.offlineReason = 'Le service movement est indisponible sur http://localhost:8082.';
        this.stopPolling();
        this.showMsg(this.offlineReason, 'err');
        this.loading = false;
        this.refreshView();
      }
    });
  }

  reportMyLiveGps(): void {
    if (!this.isPatient) {
      this.showMsg('Seul le patient peut envoyer sa position.', 'warn');
      return;
    }

    if (!navigator.geolocation || !this.selectedPatientId) {
      this.showMsg('GPS navigateur indisponible.', 'err');
      return;
    }

    this.reporting = true;
    this.refreshView();
    navigator.geolocation.getCurrentPosition(
      (pos: GeolocationPosition) => {
        this.movement.reportLocation({
          patientId: this.selectedPatientId,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          source: 'BROWSER_GPS'
        }).subscribe({
          next: () => {
            this.reporting = false;
            this.consecutiveApiErrors = 0;
            this.backendOffline = false;
            this.showMsg('Position GPS envoyee au docteur.', 'info');
            this.refresh();
            this.refreshView();
          },
          error: (error) => {
            this.reporting = false;
            this.handleApiError(error, 'Erreur lors de lenvoi GPS.');
            this.refreshView();
          }
        });
      },
      () => {
        this.reporting = false;
        this.showMsg('Impossible de lire la position GPS.', 'err');
        this.refreshView();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  acknowledge(alert: MovementAlert): void {
    this.movement.acknowledgeAlert(alert.id).subscribe({
      next: () => this.refresh(),
      error: () => this.showMsg('Impossible de valider cette alerte.', 'err')
    });
  }

  notifyPatientWhatsApp(alert: MovementAlert): void {
    if (!this.isAdminOrDoctor) {
      this.showMsg('Cette action est reservee au medecin et a ladministrateur.', 'warn');
      return;
    }

    this.sendingWhatsappAlertId = alert.id;
    this.refreshView();

    this.movement.resolvePatientWhatsAppPhone(alert.patientId).subscribe({
      next: (phone) => {
        this.sendingWhatsappAlertId = null;
        if (!phone) {
          this.showMsg('Aucun numero WhatsApp disponible pour ce patient.', 'warn');
          this.refreshView();
          return;
        }

        const patientLabel = this.getPatientLabel(alert.patientId);
        const message = [
          'Alerte mouvement patient',
          `Patient: ${patientLabel}`,
          `Type: ${alert.alertType}`,
          `Message: ${alert.message}`,
          `Date: ${alert.createdAt}`
        ].join('\n');

        const whatsappUrl = this.buildWhatsAppUrl(phone, message);
        const popup = window.open(whatsappUrl, '_blank');
        if (!popup) {
          window.location.href = whatsappUrl;
        }

        this.showMsg('Ouverture de WhatsApp vers le numero du patient.', 'info');
        this.refreshView();
      },
      error: () => {
        this.sendingWhatsappAlertId = null;
        this.showMsg('Impossible de preparer la notification WhatsApp.', 'err');
        this.refreshView();
      }
    });
  }

  getAlertClass(alert: MovementAlert): string {
    switch (alert.severity) {
      case 'CRITICAL': return 'crit';
      case 'WARNING': return 'warn';
      default: return 'info';
    }
  }

  private getPatientLabel(patientId: number): string {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) {
      return `#${patientId}`;
    }

    return `${patient.firstname || ''} ${patient.lastname || ''} (#${patient.id})`.trim();
  }

  private buildWhatsAppUrl(phone: string, message: string): string {
    const text = encodeURIComponent(message);
    return `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
  }

  private startPolling(): void {
    if (this.backendOffline) {
      return;
    }
    this.stopPolling();
    this.ngZone.runOutsideAngular(() => {
      this.pollRef = setInterval(() => {
        this.ngZone.run(() => this.refresh());
      }, 8000);
    });
  }

  retryConnection(): void {
    this.backendOffline = false;
    this.consecutiveApiErrors = 0;
    this.offlineReason = '';
    this.showMsg('Tentative de reconnexion au service movement...', 'info');
    this.refresh();
    this.startPolling();
  }

  private stopPolling(): void {
    if (this.pollRef) {
      clearInterval(this.pollRef);
      this.pollRef = null;
    }
  }

  private handleApiError(error: any, fallbackMessage: string): void {
    if (error?.status === 0) {
      this.backendOffline = true;
      this.consecutiveApiErrors = this.maxApiErrorsBeforePause;
      this.offlineReason = this.formatNetworkReason(error);
      this.stopPolling();
      this.showMsg(this.offlineReason, 'err');
      return;
    }

    const backendMessage = error?.error?.message;
    this.showMsg(backendMessage || fallbackMessage, 'err');
  }

  private formatNetworkReason(error: any): string {
    if (error?.status === 0) {
      return 'Impossible de joindre le service movement (http://localhost:8082). Demarrez le backend movement_service.';
    }
    return 'Le service movement est temporairement indisponible.';
  }

  private showMsg(message: string, type: 'info' | 'warn' | 'err' = 'info'): void {
    this.msg = message;
    this.msgType = type;
    this.refreshView();
    setTimeout(() => {
      this.msg = '';
      this.msgType = 'info';
      this.refreshView();
    }, 3500);
  }

  private initializePatientView(): void {
    const directId = Number(this.user?.id);
    if (directId && !Number.isNaN(directId)) {
      this.selectedPatientId = directId;
      this.refresh();
      this.startPolling();
      this.refreshView();
      return;
    }

    // Fallback for sessions where patient id is not present in the auth payload.
    this.movement.getPatients().subscribe({
      next: (patients) => {
        const byEmail = (patients || []).find((p) => p.email === this.user?.email);
        this.selectedPatientId = byEmail?.id || 0;
        if (!this.selectedPatientId) {
          this.showMsg('Impossible de determiner votre identifiant patient. Reconnectez-vous.', 'err');
          this.loading = false;
          this.refreshView();
          return;
        }
        this.refresh();
        this.startPolling();
        this.refreshView();
      },
      error: () => {
        this.showMsg('Erreur de resolution du profil patient.', 'err');
        this.loading = false;
        this.refreshView();
      }
    });
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
