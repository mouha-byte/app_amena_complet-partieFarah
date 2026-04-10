import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidentIntegrationService } from '../../services/incident-integration.service';
import { IncidentType } from '../../models/incident.model';

@Component({
  selector: 'app-incident-types',
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
    :host .form-select,
    :host textarea.form-input {
      color: #0f172a !important;
      background: #ffffff !important;
      border-color: #cbd5e1 !important;
    }

    :host .form-input::placeholder,
    :host textarea.form-input::placeholder {
      color: #475569 !important;
      opacity: 1;
    }
  `],
  template: `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <div>
          <h1 style="font-size:24px;font-weight:700;color:#0f172a">Types d'incidents</h1>
          <p style="color:#0f172a;font-size:14px">Gérer les catégories d'incidents</p>
        </div>
        <button class="btn-primary-alz" (click)="openForm()">
          <i class="fa-solid fa-plus"></i> Nouveau type
        </button>
      </div>

      <div class="card-alzcare" style="padding:0;overflow:hidden">
        <table class="table-alzcare">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Sévérité par défaut</th>
              <th>Points</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (t of types; track t.id) {
              <tr>
                <td style="font-weight:500">{{ t.name }}</td>
                <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ t.description }}</td>
                <td><span class="badge-alz" [class]="'badge-'+(t.defaultSeverity || 'low').toLowerCase()">{{ t.defaultSeverity }}</span></td>
                <td>{{ t.points }}</td>
                <td>
                  <button style="background:none;border:none;color:#3b82f6;cursor:pointer;padding:4px 8px" (click)="openForm(t)"><i class="fa-solid fa-pen"></i></button>
                  <button style="background:none;border:none;color:#ef4444;cursor:pointer;padding:4px 8px" (click)="deleteType(t.id!)"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (showForm) {
        <div class="modal-overlay" (click)="showForm=false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2 style="font-size:18px;font-weight:700;margin-bottom:20px">{{ editing ? 'Modifier' : 'Nouveau' }} type</h2>
            <div class="form-group">
              <label class="form-label">Nom</label>
              <input class="form-input" [(ngModel)]="form.name">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-input" [(ngModel)]="form.description"></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="form-group">
                <label class="form-label">Sévérité par défaut</label>
                <select class="form-select" [(ngModel)]="form.defaultSeverity">
                  <option value="LOW">Faible</option>
                  <option value="MEDIUM">Moyen</option>
                  <option value="HIGH">Élevé</option>
                  <option value="CRITICAL">Critique</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Points</label>
                <input class="form-input" type="number" [(ngModel)]="form.points">
              </div>
            </div>
            <div style="display:flex;gap:12px;margin-top:20px">
              <button class="btn-primary-alz" (click)="save()">{{ editing ? 'Modifier' : 'Créer' }}</button>
              <button class="btn-secondary-alz" (click)="showForm=false">Annuler</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class IncidentTypesPage implements OnInit {
  types: IncidentType[] = [];
  showForm = false;
  editing = false;
  editId = 0;
  form: any = { name: '', description: '', defaultSeverity: 'MEDIUM', points: 0 };

  constructor(private incidentService: IncidentIntegrationService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.incidentService.getAllIncidentTypes().subscribe(t => this.types = t);
  }

  openForm(t?: IncidentType): void {
    if (t) {
      this.editing = true;
      this.editId = t.id!;
      this.form = { name: t.name, description: t.description, defaultSeverity: t.defaultSeverity, points: t.points };
    } else {
      this.editing = false;
      this.form = { name: '', description: '', defaultSeverity: 'MEDIUM', points: 0 };
    }
    this.showForm = true;
  }

  save(): void {
    if (this.editing) {
      this.incidentService.updateIncidentType(this.editId, this.form).subscribe(() => { this.showForm = false; this.load(); });
    } else {
      this.incidentService.createIncidentType(this.form).subscribe(() => { this.showForm = false; this.load(); });
    }
  }

  deleteType(id: number): void {
    if (!confirm('Supprimer ce type ?')) return;
    this.incidentService.deleteIncidentType(id).subscribe(() => this.load());
  }
}
