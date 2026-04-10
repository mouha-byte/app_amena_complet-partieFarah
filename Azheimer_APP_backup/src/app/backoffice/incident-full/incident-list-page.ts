import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { IncidentIntegrationService } from '../../services/incident-integration.service';
import { Incident, IncidentType, IncidentComment } from '../../models/incident.model';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px">
        <div>
          <h1 style="font-size:24px;font-weight:700">Incidents actifs</h1>
          <p style="color:#64748b;font-size:14px">{{ incidents.length }} incident(s) trouvé(s)</p>
        </div>
        <div style="display:flex;gap:12px;align-items:center">
          <input class="form-input" style="width:250px" [(ngModel)]="search" placeholder="Rechercher..." (input)="filterIncidents()">
          <select class="form-select" style="width:150px" [(ngModel)]="filterSeverity" (change)="filterIncidents()">
            <option value="">Toutes sévérités</option>
            <option value="LOW">Faible</option>
            <option value="MEDIUM">Moyen</option>
            <option value="HIGH">Élevé</option>
            <option value="CRITICAL">Critique</option>
          </select>
        </div>
      </div>

      @if (loading) {
        <div style="text-align:center;padding:48px"><div class="spinner" style="margin:0 auto"></div></div>
      } @else if (filtered.length === 0) {
        <div class="card-alzcare" style="text-align:center;padding:48px">
          <i class="fa-solid fa-inbox" style="font-size:48px;color:#cbd5e1;margin-bottom:16px"></i>
          <p style="color:#64748b">Aucun incident trouvé</p>
        </div>
      } @else {
        <div class="card-alzcare" style="padding:0;overflow:hidden">
          <table class="table-alzcare">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Description</th>
                <th>Sévérité</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (inc of filtered; track inc.id) {
                <tr>
                  <td>{{ inc.id }}</td>
                  <td><span style="font-weight:500">{{ inc.type?.name || '-' }}</span></td>
                  <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ inc.description }}</td>
                  <td><span class="badge-alz" [class]="'badge-'+inc.severityLevel.toLowerCase()">{{ getSeverityLabel(inc.severityLevel) }}</span></td>
                  <td><span class="badge-alz" [class]="getStatusBadge(inc.status)">{{ getStatusLabel(inc.status) }}</span></td>
                  <td style="white-space:nowrap">{{ inc.incidentDate | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <button style="background:none;border:none;color:#3b82f6;cursor:pointer;font-size:16px;padding:4px 8px" title="Détail" (click)="openDetail(inc)">
                      <i class="fa-solid fa-eye"></i>
                    </button>
                    @if (isAdmin) {
                      <button style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;padding:4px 8px" title="Supprimer" (click)="deleteIncident(inc.id!)">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Detail Modal -->
      @if (selectedIncident) {
        <div class="modal-overlay" (click)="selectedIncident=null">
          <div class="modal-content modal-content-lg" (click)="$event.stopPropagation()">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px">
              <h2 style="font-size:20px;font-weight:700">Détail de l'incident #{{ selectedIncident.id }}</h2>
              <button style="background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8" (click)="selectedIncident=null">&times;</button>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
              <div><span style="font-size:12px;color:#64748b">Type</span><br><strong>{{ selectedIncident.type?.name || '-' }}</strong></div>
              <div><span style="font-size:12px;color:#64748b">Sévérité</span><br><span class="badge-alz" [class]="'badge-'+selectedIncident.severityLevel.toLowerCase()">{{ selectedIncident.severityLevel }}</span></div>
              <div><span style="font-size:12px;color:#64748b">Statut</span><br><span class="badge-alz" [class]="getStatusBadge(selectedIncident.status)">{{ getStatusLabel(selectedIncident.status) }}</span></div>
              <div><span style="font-size:12px;color:#64748b">Date</span><br><strong>{{ selectedIncident.incidentDate | date:'dd/MM/yyyy HH:mm' }}</strong></div>
              <div><span style="font-size:12px;color:#64748b">Patient ID</span><br><strong>{{ selectedIncident.patientId }}</strong></div>
              <div><span style="font-size:12px;color:#64748b">Score</span><br><strong>{{ selectedIncident.computedScore || '-' }}</strong></div>
            </div>

            <div style="margin-bottom:20px">
              <span style="font-size:12px;color:#64748b">Description</span>
              <p style="margin-top:6px;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0">{{ selectedIncident.description }}</p>
            </div>

            @if (isAdmin) {
              <div style="margin-bottom:20px">
                <label class="form-label">Changer le statut</label>
                <div style="display:flex;gap:8px">
                  <select class="form-select" style="width:auto" [(ngModel)]="newStatus">
                    <option value="OPEN">Ouvert</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="RESOLVED">Résolu</option>
                  </select>
                  <button class="btn-primary-alz" (click)="updateStatus()">Mettre à jour</button>
                </div>
              </div>
            }

            <!-- Comments -->
            <div style="border-top:1px solid #e2e8f0;padding-top:16px">
              <h3 style="font-size:14px;font-weight:600;margin-bottom:12px">Commentaires ({{ comments.length }})</h3>
              @for (c of comments; track c.id) {
                <div style="background:#f8fafc;padding:10px 14px;border-radius:8px;margin-bottom:8px;border:1px solid #f1f5f9">
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                    <span style="font-weight:500;font-size:13px">{{ c.authorName }}</span>
                    <span style="font-size:12px;color:#94a3b8">{{ c.createdAt | date:'dd/MM HH:mm' }}</span>
                  </div>
                  <p style="font-size:14px;color:#475569">{{ c.content }}</p>
                </div>
              }
              <div style="display:flex;gap:8px;margin-top:12px">
                <input class="form-input" [(ngModel)]="newComment" placeholder="Ajouter un commentaire..." (keyup.enter)="addComment()">
                <button class="btn-primary-alz" (click)="addComment()" [disabled]="!newComment.trim()">Envoyer</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class IncidentListPage implements OnInit {
  incidents: Incident[] = [];
  filtered: Incident[] = [];
  loading = true;
  search = '';
  filterSeverity = '';
  isAdmin = false;
  selectedIncident: Incident | null = null;
  comments: IncidentComment[] = [];
  newComment = '';
  newStatus = '';

  constructor(private incidentService: IncidentIntegrationService, private authService: AuthService) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin;
    this.loadIncidents();
  }

  private loadIncidents(): void {
    const role = this.authService.getRole();
    const userId = this.authService.getUserId();

    if (role === 'ADMIN' || role === 'DOCTOR') {
      this.incidentService.getAllActiveIncidents().subscribe(list => this.setIncidents(list));
    } else if (role === 'CAREGIVER' && userId) {
      // Load only incidents for the caregiver's own patients
      this.authService.getPatientsByCaregiver(userId).subscribe({
        next: (patients) => {
          const patientIds = patients.map(p => p.userId);
          this.incidentService.getAllActiveIncidents().subscribe(list => {
            this.setIncidents(list.filter(i => i.patientId && patientIds.includes(i.patientId)));
          });
        },
        error: () => {
          this.incidentService.getIncidentsByCaregiver(userId).subscribe(list => this.setIncidents(list));
        }
      });
    } else if (userId) {
      this.incidentService.getIncidentsByPatient(userId).subscribe(list => this.setIncidents(list));
    }
  }

  private setIncidents(list: Incident[]): void {
    this.incidents = list;
    this.filterIncidents();
    this.loading = false;
  }

  filterIncidents(): void {
    this.filtered = this.incidents.filter(i => {
      const matchSearch = !this.search || i.description.toLowerCase().includes(this.search.toLowerCase()) || (i.type?.name || '').toLowerCase().includes(this.search.toLowerCase());
      const matchSeverity = !this.filterSeverity || i.severityLevel === this.filterSeverity;
      return matchSearch && matchSeverity;
    });
  }

  openDetail(inc: Incident): void {
    this.selectedIncident = inc;
    this.newStatus = inc.status;
    this.comments = [];
    this.newComment = '';
    this.incidentService.getCommentsByIncident(inc.id!).subscribe(c => this.comments = c);
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.selectedIncident) return;
    const userId = this.authService.getUserId();
    const name = this.authService.getFullName();
    this.incidentService.addComment(this.selectedIncident.id!, {
      content: this.newComment,
      authorId: userId ?? 0,
      authorName: name
    }).subscribe(c => {
      this.comments.push(c);
      this.newComment = '';
    });
  }

  updateStatus(): void {
    if (!this.selectedIncident) return;
    this.incidentService.updateIncidentStatus(this.selectedIncident.id!, this.newStatus).subscribe(updated => {
      this.selectedIncident!.status = updated.status;
      const idx = this.incidents.findIndex(i => i.id === updated.id);
      if (idx >= 0) this.incidents[idx] = updated;
      this.filterIncidents();
    });
  }

  deleteIncident(id: number): void {
    if (!confirm('Supprimer cet incident ?')) return;
    this.incidentService.deleteIncident(id).subscribe(() => {
      this.incidents = this.incidents.filter(i => i.id !== id);
      this.filterIncidents();
    });
  }

  getSeverityLabel(s: string): string {
    const m: Record<string, string> = { LOW: 'Faible', MEDIUM: 'Moyen', HIGH: 'Élevé', CRITICAL: 'Critique' };
    return m[s] || s;
  }
  getStatusLabel(s: string): string {
    const m: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Résolu' };
    return m[s] || s;
  }
  getStatusBadge(s: string): string { return 'badge-' + s.toLowerCase().replace('_', '-'); }
}
