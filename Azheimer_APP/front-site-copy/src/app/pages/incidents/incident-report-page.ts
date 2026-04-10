import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IncidentService } from '../../core/services/incident.service';
import { IncidentType } from '../../core/models/incident.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-incident-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:640px">
      <h1 style="font-size:24px;font-weight:700;margin-bottom:4px">Signaler un incident</h1>
      <p style="color:#64748b;font-size:14px;margin-bottom:24px">Remplissez le formulaire pour déclarer un nouvel incident</p>

      @if (success) {
        <div class="alert-success" style="margin-bottom:16px">
          <i class="fa-solid fa-check-circle"></i> Incident signalé avec succès !
        </div>
      }
      @if (error) {
        <div class="alert-error" style="margin-bottom:16px">
          <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
        </div>
      }

      <div class="card-alzcare">
        @if (showPatientField) {
          <div class="form-group">
            <label class="form-label">Patient concerné *</label>
            @if (patients.length > 0) {
              <select class="form-select" [(ngModel)]="form.patientId">
                <option [ngValue]="null">-- Sélectionner un patient --</option>
                @for (p of patients; track p.userId) {
                  <option [ngValue]="p.userId">{{ p.firstName }} {{ p.lastName }}</option>
                }
              </select>
            } @else {
              <p style="color:#94a3b8;font-size:13px;padding:8px 0">Chargement des patients...</p>
            }
          </div>
        }

        <div class="form-group">
          <label class="form-label">Type d'incident *</label>
          <input class="form-input" [(ngModel)]="form.typeName" placeholder="Ex: Chute, Fugue, Oubli de médicament, Agitation...">
          <span style="font-size:12px;color:#94a3b8;margin-top:4px;display:block">Décrivez le type d'incident</span>
        </div>

        <div class="form-group">
          <label class="form-label">Sévérité *</label>
          <select class="form-select" [(ngModel)]="form.severityLevel">
            <option value="LOW">Faible</option>
            <option value="MEDIUM">Moyen</option>
            <option value="HIGH">Élevé</option>
            <option value="CRITICAL">Critique</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Date de l'incident *</label>
          <input class="form-input" type="datetime-local" [(ngModel)]="form.incidentDate">
        </div>

        <div class="form-group">
          <label class="form-label">Description *</label>
          <textarea class="form-input" [(ngModel)]="form.description" placeholder="Décrivez l'incident en détail..." rows="4"></textarea>
        </div>

        <div style="display:flex;gap:12px;margin-top:20px">
          <button class="btn-primary-alz" [disabled]="loading" (click)="submit()">
            @if (loading) { <span class="spinner" style="display:inline-block;width:16px;height:16px;margin-right:8px;vertical-align:middle"></span> }
            <i class="fa-solid fa-paper-plane"></i> Soumettre
          </button>
          <button class="btn-secondary-alz" (click)="reset()">Réinitialiser</button>
        </div>
      </div>
    </div>
  `
})
export class IncidentReportPage implements OnInit {
  types: IncidentType[] = [];
  patients: User[] = [];
  isCaregiver = false;
  showPatientField = false;
  loading = false;
  success = false;
  error = '';
  form: any = { typeName: '', severityLevel: 'MEDIUM', incidentDate: '', description: '', patientId: null };

  constructor(private incidentService: IncidentService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const role = this.authService.getRole();
    this.isCaregiver = role === 'CAREGIVER';
    this.showPatientField = role !== 'PATIENT'; // ADMIN, DOCTOR, CAREGIVER all can pick a patient

    // Load incident types (kept for potential future use)
    this.incidentService.getAllIncidentTypes().subscribe(t => this.types = t);

    // Load patients list
    if (this.showPatientField) {
      if (this.isCaregiver) {
        const uid = this.authService.getUserId();
        if (uid) {
          this.authService.getPatientsByCaregiver(uid).subscribe({
            next: p => {
              this.patients = p;
              // Fallback: if no assigned patients, load all patients
              if (p.length === 0) this.loadAllPatients();
            },
            error: () => this.loadAllPatients()
          });
        }
      } else {
        // ADMIN or DOCTOR: load all patients
        this.loadAllPatients();
      }
    }

    const now = new Date();
    this.form.incidentDate = now.toISOString().slice(0, 16);
  }

  private loadAllPatients(): void {
    this.authService.getAllUsers().subscribe(users => {
      this.patients = users.filter(u => u.role === 'PATIENT');
    });
  }

  submit(): void {
    if (!this.form.typeName?.trim() || !this.form.description || !this.form.incidentDate) {
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    if (this.showPatientField && !this.form.patientId) {
      this.error = 'Veuillez sélectionner un patient.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    // Find matching existing type
    const matchingType = this.types.find(t => t.name?.toLowerCase() === this.form.typeName.trim().toLowerCase());

    if (matchingType) {
      // Type exists — submit directly with its ID
      this.submitIncident(matchingType.id!);
    } else {
      // Type doesn't exist — create it first, then submit
      const newType: any = {
        name: this.form.typeName.trim(),
        defaultSeverity: this.form.severityLevel,
        points: 10
      };
      this.incidentService.createIncidentType(newType).subscribe({
        next: (createdType) => {
          this.types.push(createdType); // cache it
          this.submitIncident(createdType.id!);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Erreur lors de la création du type d\'incident.';
        }
      });
    }
  }

  private submitIncident(typeId: number): void {
    const userId = this.authService.getUserId();
    const role = this.authService.getRole();
    const payload: any = {
      description: this.form.description,
      severityLevel: this.form.severityLevel,
      incidentDate: this.form.incidentDate,
      type: { id: typeId },
      patientId: this.showPatientField ? this.form.patientId : userId,
      caregiverId: this.isCaregiver ? userId : null,
      source: role // DOCTOR, CAREGIVER, ADMIN, PATIENT — used by backend for email notification
    };

    this.incidentService.createIncident(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.reset();
        setTimeout(() => this.router.navigate(['/incidents']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de la création.';
      }
    });
  }

  reset(): void {
    this.form = { typeName: '', severityLevel: 'MEDIUM', incidentDate: new Date().toISOString().slice(0, 16), description: '', patientId: null };
  }
}
