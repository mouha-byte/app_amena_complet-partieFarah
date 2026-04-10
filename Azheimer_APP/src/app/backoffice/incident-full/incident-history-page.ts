import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { IncidentIntegrationService } from '../../services/incident-integration.service';
import { Incident } from '../../models/incident.model';

@Component({
  selector: 'app-incident-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host {
      display: block;
      color: #0f172a;
    }

    :host .table-alzcare thead th {
      color: #334155;
      font-weight: 700;
    }

    :host .table-alzcare tbody td {
      color: #0f172a;
    }

    :host .form-input,
    :host .form-select {
      color: #0f172a !important;
      background: #ffffff !important;
      border-color: #cbd5e1 !important;
    }

    :host .form-input::placeholder {
      color: #475569 !important;
      opacity: 1;
    }
  `],
  template: `
    <div>
      <h1 style="font-size:24px;font-weight:700;margin-bottom:4px;color:#0f172a">Historique des incidents</h1>
      <p style="color:#0f172a;font-size:14px;margin-bottom:24px">Tous les incidents passés et actuels</p>

      <div style="margin-bottom:16px">
        <input class="form-input" style="max-width:300px" [(ngModel)]="search" placeholder="Rechercher..." (input)="filter()">
      </div>

      @if (loading) {
        <div style="text-align:center;padding:48px"><div class="spinner" style="margin:0 auto"></div></div>
      } @else if (filtered.length === 0) {
        <div class="card-alzcare" style="text-align:center;padding:48px">
          <i class="fa-solid fa-folder-open" style="font-size:48px;color:#cbd5e1;margin-bottom:16px"></i>
          <p style="color:#0f172a">Aucun historique disponible</p>
        </div>
      } @else {
        <div class="card-alzcare" style="padding:0;overflow-x:auto">
          <table class="table-alzcare">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Description</th>
                <th>Sévérité</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              @for (inc of filtered; track inc.id) {
                <tr>
                  <td>{{ inc.id }}</td>
                  <td>{{ inc.type?.name || '-' }}</td>
                  <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ inc.description }}</td>
                  <td><span class="badge-alz" [class]="'badge-'+inc.severityLevel.toLowerCase()">{{ inc.severityLevel }}</span></td>
                  <td><span class="badge-alz" [class]="'badge-'+inc.status.toLowerCase().replace('_','-')">{{ getStatusLabel(inc.status) }}</span></td>
                  <td style="white-space:nowrap">{{ inc.incidentDate | date:'dd/MM/yyyy' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class IncidentHistoryPage implements OnInit {
  incidents: Incident[] = [];
  filtered: Incident[] = [];
  loading = true;
  search = '';

  constructor(private incidentService: IncidentIntegrationService, private authService: AuthService) {}

  ngOnInit(): void {
    const role = this.authService.getRole();
    const userId = this.authService.getUserId();
    if (role === 'ADMIN' || role === 'DOCTOR') {
      this.incidentService.getIncidentHistory().subscribe(l => this.set(l));
    } else if (role === 'CAREGIVER' && userId) {
      // Load only history for the caregiver's own patients
      this.authService.getPatientsByCaregiver(userId).subscribe({
        next: (patients) => {
          const patientIds = patients.map(p => p.userId);
          this.incidentService.getIncidentHistory().subscribe(l => {
            this.set(l.filter(i => i.patientId && patientIds.includes(i.patientId)));
          });
        },
        error: () => {
          this.incidentService.getIncidentsByCaregiver(userId).subscribe(l => this.set(l));
        }
      });
    } else if (userId) {
      this.incidentService.getPatientIncidentsHistory(userId).subscribe(l => this.set(l));
    }
  }

  private set(list: Incident[]): void {
    this.incidents = list;
    this.filter();
    this.loading = false;
  }

  filter(): void {
    this.filtered = this.incidents.filter(i =>
      !this.search || i.description.toLowerCase().includes(this.search.toLowerCase()) || (i.type?.name || '').toLowerCase().includes(this.search.toLowerCase())
    );
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Résolu' };
    return m[s] || s;
  }

  getStatusBadge(s: string): string { return 'badge-' + s.toLowerCase().replace('_', '-'); }
}
