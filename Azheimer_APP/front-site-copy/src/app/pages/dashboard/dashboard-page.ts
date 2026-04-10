import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IncidentService } from '../../core/services/incident.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Incident } from '../../core/models/incident.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <h1 style="font-size:24px;font-weight:700;margin-bottom:4px">Tableau de bord</h1>
      <p style="color:#64748b;font-size:14px;margin-bottom:24px">Vue d'ensemble de l'activité — {{ getRoleLabel() }}</p>

      <!-- Stats cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:24px">
        <div class="stat-card">
          <div class="stat-icon" style="background:#dbeafe;color:#2563eb">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <div style="font-size:24px;font-weight:700">{{ activeCount }}</div>
            <div style="font-size:13px;color:#64748b">Incidents actifs</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fef3c7;color:#d97706">
            <i class="fa-solid fa-spinner"></i>
          </div>
          <div>
            <div style="font-size:24px;font-weight:700">{{ inProgressCount }}</div>
            <div style="font-size:13px;color:#64748b">En cours</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#d1fae5;color:#059669">
            <i class="fa-solid fa-check-circle"></i>
          </div>
          <div>
            <div style="font-size:24px;font-weight:700">{{ resolvedCount }}</div>
            <div style="font-size:13px;color:#64748b">Résolus</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fecaca;color:#dc2626">
            <i class="fa-solid fa-bolt"></i>
          </div>
          <div>
            <div style="font-size:24px;font-weight:700">{{ criticalCount }}</div>
            <div style="font-size:13px;color:#64748b">Critiques</div>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="card-alzcare" style="margin-bottom:24px">
        <h2 style="font-size:16px;font-weight:600;margin-bottom:16px">Actions rapides</h2>
        <div style="display:flex;flex-wrap:wrap;gap:12px">
          @if (role === 'PATIENT' || role === 'CAREGIVER') {
            <a routerLink="/incidents/report" class="btn-primary-alz" style="text-decoration:none">
              <i class="fa-solid fa-plus"></i> Signaler un incident
            </a>
          }
          <a routerLink="/incidents" class="btn-secondary-alz" style="text-decoration:none">
            <i class="fa-solid fa-list"></i> Voir les incidents
          </a>
          <a routerLink="/forum" class="btn-secondary-alz" style="text-decoration:none">
            <i class="fa-solid fa-comments"></i> Forum
          </a>
          <a routerLink="/chat" class="btn-secondary-alz" style="text-decoration:none">
            <i class="fa-solid fa-robot"></i> Chatbot IA
          </a>
        </div>
      </div>

      <!-- Recent incidents -->
      <div class="card-alzcare">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h2 style="font-size:16px;font-weight:600">Derniers incidents</h2>
          <a routerLink="/incidents" style="font-size:13px;color:#3b82f6;text-decoration:none">Voir tout →</a>
        </div>
        @if (recentIncidents.length === 0) {
          <p style="color:#94a3b8;font-size:14px;text-align:center;padding:24px">Aucun incident récent</p>
        } @else {
          <table class="table-alzcare">
            <thead>
              <tr>
                <th>Description</th>
                <th>Sévérité</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              @for (inc of recentIncidents; track inc.id) {
                <tr>
                  <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ inc.description }}</td>
                  <td><span class="badge-alz" [class]="getSeverityClass(inc.severityLevel)">{{ inc.severityLevel }}</span></td>
                  <td><span class="badge-alz" [class]="getStatusClass(inc.status)">{{ getStatusLabel(inc.status) }}</span></td>
                  <td style="white-space:nowrap">{{ inc.incidentDate | date:'dd/MM/yyyy' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `
})
export class DashboardPage implements OnInit {
  role = '';
  activeCount = 0;
  inProgressCount = 0;
  resolvedCount = 0;
  criticalCount = 0;
  recentIncidents: Incident[] = [];

  constructor(
    private authService: AuthService,
    private incidentService: IncidentService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.loadIncidents();
  }

  private loadIncidents(): void {
    const userId = this.authService.getUserId();
    if (this.role === 'ADMIN' || this.role === 'DOCTOR') {
      this.incidentService.getAllActiveIncidents().subscribe(list => this.processIncidents(list));
    } else if (this.role === 'CAREGIVER' && userId) {
      this.incidentService.getIncidentsByCaregiver(userId).subscribe(list => this.processIncidents(list));
    } else if (userId) {
      this.incidentService.getIncidentsByPatient(userId).subscribe(list => this.processIncidents(list));
    }
  }

  private processIncidents(list: Incident[]): void {
    this.activeCount = list.filter(i => i.status === 'OPEN').length;
    this.inProgressCount = list.filter(i => i.status === 'IN_PROGRESS').length;
    this.resolvedCount = list.filter(i => i.status === 'RESOLVED').length;
    this.criticalCount = list.filter(i => i.severityLevel === 'CRITICAL').length;
    this.recentIncidents = list.slice(0, 5);
  }

  getRoleLabel(): string {
    const map: Record<string, string> = { ADMIN: 'Administrateur', DOCTOR: 'Médecin', CAREGIVER: 'Aidant', PATIENT: 'Patient' };
    return map[this.role] || this.role;
  }

  getSeverityClass(s: string): string {
    return 'badge-' + s.toLowerCase();
  }

  getStatusClass(s: string): string {
    return 'badge-' + s.toLowerCase().replace('_', '-');
  }

  getStatusLabel(s: string): string {
    const map: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Résolu' };
    return map[s] || s;
  }
}
