import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { IncidentService } from '../../core/services/incident.service';
import { Incident, IncidentComment, IncidentType } from '../../core/models/incident.model';

@Component({
  selector: 'app-incident-reported',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 style="font-size:24px;font-weight:700;margin-bottom:4px">Incidents signalés</h1>
      <p style="color:#64748b;font-size:14px;margin-bottom:24px">Incidents soumis par les aidants et patients</p>

      @if (loading) {
        <div style="text-align:center;padding:48px"><div class="spinner" style="margin:0 auto"></div></div>
      } @else if (incidents.length === 0) {
        <div class="card-alzcare" style="text-align:center;padding:48px">
          <p style="color:#64748b">Aucun incident signalé</p>
        </div>
      } @else {
        <div class="card-alzcare" style="padding:0;overflow-x:auto">
          <table class="table-alzcare">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Patient</th>
                <th>Sévérité</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (inc of incidents; track inc.id) {
                <tr>
                  <td>{{ inc.id }}</td>
                  <td>{{ inc.type?.name || '-' }}</td>
                  <td>{{ getPatientName(inc.patientId!) }}</td>
                  <td><span class="badge-alz" [class]="'badge-'+inc.severityLevel.toLowerCase()">{{ inc.severityLevel }}</span></td>
                  <td>
                    <select class="form-select" style="width:130px;padding:6px 10px;font-size:13px" [ngModel]="inc.status" (ngModelChange)="changeStatus(inc, $event)">
                      <option value="OPEN">Ouvert</option>
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="RESOLVED">Résolu</option>
                    </select>
                  </td>
                  <td style="white-space:nowrap">{{ inc.incidentDate | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <button style="background:none;border:none;color:#3b82f6;cursor:pointer" (click)="openDetail(inc)"><i class="fa-solid fa-eye"></i></button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (selectedIncident) {
        <div class="modal-overlay" (click)="selectedIncident=null">
          <div class="modal-content modal-content-lg" (click)="$event.stopPropagation()">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px">
              <h2 style="font-size:18px;font-weight:700">Incident #{{ selectedIncident.id }}</h2>
              <button style="background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8" (click)="selectedIncident=null">&times;</button>
            </div>
            <p style="background:#f8fafc;padding:12px;border-radius:8px;margin-bottom:16px;border:1px solid #e2e8f0">{{ selectedIncident.description }}</p>

            <h3 style="font-size:14px;font-weight:600;margin-bottom:8px">Commentaires</h3>
            @for (c of comments; track c.id) {
              <div style="background:#f8fafc;padding:10px 14px;border-radius:8px;margin-bottom:6px;border:1px solid #f1f5f9">
                <strong style="font-size:13px">{{ c.authorName }}</strong>
                <span style="font-size:12px;color:#94a3b8;margin-left:8px">{{ c.createdAt | date:'dd/MM HH:mm' }}</span>
                <p style="margin-top:4px;font-size:14px">{{ c.content }}</p>
              </div>
            }
            <div style="display:flex;gap:8px;margin-top:12px">
              <input class="form-input" [(ngModel)]="newComment" placeholder="Commentaire..." (keyup.enter)="addComment()">
              <button class="btn-primary-alz" (click)="addComment()">Envoyer</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class IncidentReportedPage implements OnInit {
  incidents: Incident[] = [];
  loading = true;
  patientNames: Record<number, string> = {};
  selectedIncident: Incident | null = null;
  comments: IncidentComment[] = [];
  newComment = '';

  constructor(private incidentService: IncidentService, private authService: AuthService) {}

  ngOnInit(): void {
    this.incidentService.getReportedIncidents().subscribe(list => {
      this.incidents = list;
      this.loading = false;
      list.forEach(inc => {
        if (inc.patientId && !this.patientNames[inc.patientId]) {
          this.authService.getUserById(inc.patientId).subscribe(u => {
            this.patientNames[u.userId] = `${u.firstName} ${u.lastName}`;
          });
        }
      });
    });
  }

  getPatientName(id: number): string {
    return this.patientNames[id] || `Patient #${id}`;
  }

  changeStatus(inc: Incident, status: string): void {
    this.incidentService.updateIncidentStatus(inc.id!, status).subscribe(u => inc.status = u.status);
  }

  openDetail(inc: Incident): void {
    this.selectedIncident = inc;
    this.comments = [];
    this.newComment = '';
    this.incidentService.getCommentsByIncident(inc.id!).subscribe(c => this.comments = c);
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.selectedIncident) return;
    this.incidentService.addComment(this.selectedIncident.id!, {
      content: this.newComment,
      authorId: this.authService.getUserId() ?? 0,
      authorName: this.authService.getFullName()
    }).subscribe(c => { this.comments.push(c); this.newComment = ''; });
  }
}
