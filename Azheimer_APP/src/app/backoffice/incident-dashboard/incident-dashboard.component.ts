import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IncidentIntegrationService, IncidentItem } from '../../services/incident-integration.service';

@Component({
  selector: 'app-incident-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './incident-dashboard.component.html',
  styleUrls: ['./incident-dashboard.component.css']
})
export class IncidentDashboardComponent implements OnInit {
  loading = true;
  error = '';

  incidents: IncidentItem[] = [];
  filtered: IncidentItem[] = [];

  search = '';
  severity = '';

  constructor(
    private auth: AuthService,
    private incidentService: IncidentIntegrationService
  ) {}

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.loading = true;
    this.error = '';

    const user = this.auth.currentUser;
    if (!user) {
      this.error = 'Utilisateur non authentifie.';
      this.loading = false;
      return;
    }

    const role = user.role;
    const userId = user.id;

    const request$ =
      role === 'ADMIN' || role === 'DOCTOR'
        ? this.incidentService.getAllActiveIncidents()
        : role === 'CAREGIVER'
          ? this.incidentService.getIncidentsByCaregiver(userId)
          : this.incidentService.getIncidentsByPatient(userId);

    request$.subscribe({
      next: (list) => {
        this.incidents = list || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les incidents. Verifiez incident_service (port 8089).';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const q = this.search.trim().toLowerCase();
    this.filtered = this.incidents.filter((it) => {
      const text = `${it.description || ''} ${it.type?.name || ''}`.toLowerCase();
      const searchOk = !q || text.includes(q);
      const sevOk = !this.severity || it.severityLevel === this.severity;
      return searchOk && sevOk;
    });
  }

  getSeverityLabel(value: string): string {
    const labels: Record<string, string> = {
      LOW: 'Faible',
      MEDIUM: 'Moyen',
      HIGH: 'Eleve',
      CRITICAL: 'Critique'
    };
    return labels[value] || value;
  }

  getStatusLabel(value: string): string {
    const labels: Record<string, string> = {
      OPEN: 'Ouvert',
      IN_PROGRESS: 'En cours',
      RESOLVED: 'Resolu'
    };
    return labels[value] || value;
  }
}
