import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidentIntegrationService } from '../../services/incident-integration.service';
import { PatientStats } from '../../models/incident.model';

@Component({
  selector: 'app-patient-stats-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:1200px;margin:0 auto">
      <!-- Hero Header -->
      <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#7c3aed 100%);border-radius:16px;padding:32px;margin-bottom:28px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:rgba(255,255,255,0.06);border-radius:50%"></div>
        <div style="position:absolute;bottom:-60px;left:30%;width:300px;height:300px;background:rgba(255,255,255,0.04);border-radius:50%"></div>
        <div style="position:relative;z-index:1">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">
            <div style="width:48px;height:48px;background:rgba(255,255,255,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center">
              <i class="fa-solid fa-chart-line" style="font-size:22px;color:#fff"></i>
            </div>
            <div>
              <h1 style="font-size:24px;font-weight:800;color:#fff;margin:0">Statistiques par patient</h1>
              <p style="font-size:14px;color:rgba(255,255,255,0.7);margin:0">Score de gravité, fréquence et répartition des incidents</p>
            </div>
          </div>
          <!-- Summary cards -->
          <div style="display:flex;gap:16px;margin-top:20px;flex-wrap:wrap" *ngIf="!loading && stats.length > 0">
            <div style="background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border-radius:12px;padding:14px 22px;min-width:140px">
              <p style="font-size:28px;font-weight:800;color:#fff">{{ stats.length }}</p>
              <p style="font-size:12px;color:rgba(255,255,255,0.7)">Patients suivis</p>
            </div>
            <div style="background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border-radius:12px;padding:14px 22px;min-width:140px">
              <p style="font-size:28px;font-weight:800;color:#fff">{{ totalIncidentsAll }}</p>
              <p style="font-size:12px;color:rgba(255,255,255,0.7)">Total incidents</p>
            </div>
            <div style="background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border-radius:12px;padding:14px 22px;min-width:140px">
              <p style="font-size:28px;font-weight:800;color:#fbbf24">{{ criticalCount }}</p>
              <p style="font-size:12px;color:rgba(255,255,255,0.7)">Risque critique/élevé</p>
            </div>
            <div style="background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border-radius:12px;padding:14px 22px;min-width:140px">
              <p style="font-size:28px;font-weight:800;color:#34d399">{{ avgScore }}</p>
              <p style="font-size:12px;color:rgba(255,255,255,0.7)">Score moyen</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search bar -->
      <div style="display:flex;gap:12px;margin-bottom:24px;align-items:center" *ngIf="!loading && stats.length > 0">
        <div style="flex:1;position:relative">
          <i class="fa-solid fa-search" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:14px"></i>
          <input class="form-input" style="padding-left:40px;width:100%" [(ngModel)]="searchQuery" placeholder="Rechercher un patient..." (input)="filterStats()">
        </div>
        <select class="form-select" style="width:180px" [(ngModel)]="riskFilter" (change)="filterStats()">
          <option value="">Tous les niveaux</option>
          <option value="CRITICAL">Critique</option>
          <option value="HIGH">Élevé</option>
          <option value="MODERATE">Modéré</option>
          <option value="LOW">Faible</option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" style="text-align:center;padding:80px">
        <div class="spinner" style="margin:0 auto;width:48px;height:48px"></div>
        <p style="color:#0f172a;margin-top:16px;font-size:14px">Chargement des statistiques...</p>
      </div>

      <!-- No data -->
      <div *ngIf="!loading && stats.length === 0" style="text-align:center;padding:80px;background:#fff;border-radius:16px;border:1px solid #e2e8f0">
        <i class="fa-solid fa-chart-bar" style="font-size:56px;color:#cbd5e1;margin-bottom:16px"></i>
        <p style="font-size:18px;font-weight:600;color:#475569">Aucune donnée disponible</p>
        <p style="color:#94a3b8;font-size:14px;margin-top:4px">Les statistiques apparaîtront une fois les incidents enregistrés</p>
      </div>

      <!-- Selected patient detail panel -->
      <div *ngIf="selectedPatient" style="margin-bottom:28px;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;border:1px solid #e2e8f0">
        <!-- Gradient banner -->
        <div style="padding:28px 32px;position:relative;overflow:hidden"
             [style.background]="'linear-gradient(135deg, ' + riskGradient(selectedPatient.riskLevel) + ')'">
          <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.08);border-radius:50%"></div>
          <div style="display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1">
            <div style="display:flex;align-items:center;gap:16px">
              <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center">
                <i class="fa-solid fa-user" style="font-size:24px;color:#fff"></i>
              </div>
              <div>
                <h2 style="font-size:22px;font-weight:800;color:#fff;margin:0">{{ selectedPatient.patientName }}</h2>
                <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:4px 0 0">ID: {{ selectedPatient.patientId }}</p>
              </div>
            </div>
            <button (click)="selectedPatient = null"
                    style="width:36px;height:36px;background:rgba(255,255,255,0.15);border:none;border-radius:50%;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Score ring + stats -->
        <div style="padding:28px 32px;display:grid;grid-template-columns:200px 1fr;gap:32px;align-items:center">
          <!-- Circular score gauge -->
          <div style="text-align:center">
            <div style="position:relative;width:140px;height:140px;margin:0 auto">
              <svg viewBox="0 0 140 140" style="transform:rotate(-90deg);width:140px;height:140px">
                <circle cx="70" cy="70" r="58" fill="none" stroke="#f1f5f9" stroke-width="12"/>
                <circle cx="70" cy="70" r="58" fill="none"
                        [attr.stroke]="riskColor(selectedPatient.riskLevel)"
                        stroke-width="12"
                        stroke-linecap="round"
                        [attr.stroke-dasharray]="364.4"
                        [attr.stroke-dashoffset]="364.4 - (364.4 * selectedPatient.severityScore / 100)"/>
              </svg>
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
                <span style="font-size:32px;font-weight:800;line-height:1" [style.color]="riskColor(selectedPatient.riskLevel)">{{ selectedPatient.severityScore }}</span>
                <span style="font-size:14px;color:#94a3b8;display:block">/100</span>
              </div>
            </div>
            <span style="display:inline-block;margin-top:10px;padding:4px 16px;border-radius:20px;font-size:13px;font-weight:700"
                  [style.background]="riskBg(selectedPatient.riskLevel)"
                  [style.color]="riskColor(selectedPatient.riskLevel)">
              {{ riskLabel(selectedPatient.riskLevel) }}
            </span>
          </div>

          <!-- Stat cards -->
          <div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px">
              <div style="background:#f8fafc;border-radius:12px;padding:16px;text-align:center;border:1px solid #f1f5f9">
                <i class="fa-solid fa-triangle-exclamation" style="color:#6366f1;font-size:18px;margin-bottom:8px"></i>
                <p style="font-size:28px;font-weight:800;color:#1e293b;line-height:1">{{ selectedPatient.totalIncidents }}</p>
                <p style="font-size:12px;color:#64748b;margin-top:4px">Total</p>
              </div>
              <div style="background:#fff7ed;border-radius:12px;padding:16px;text-align:center;border:1px solid #fed7aa">
                <i class="fa-solid fa-fire" style="color:#ea580c;font-size:18px;margin-bottom:8px"></i>
                <p style="font-size:28px;font-weight:800;color:#ea580c;line-height:1">{{ selectedPatient.activeIncidents }}</p>
                <p style="font-size:12px;color:#64748b;margin-top:4px">Actifs</p>
              </div>
              <div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;border:1px solid #bbf7d0">
                <i class="fa-solid fa-circle-check" style="color:#16a34a;font-size:18px;margin-bottom:8px"></i>
                <p style="font-size:28px;font-weight:800;color:#16a34a;line-height:1">{{ selectedPatient.resolvedIncidents }}</p>
                <p style="font-size:12px;color:#64748b;margin-top:4px">Résolus</p>
              </div>
              <div style="background:#eff6ff;border-radius:12px;padding:16px;text-align:center;border:1px solid #bfdbfe">
                <i class="fa-solid fa-clock" style="color:#2563eb;font-size:18px;margin-bottom:8px"></i>
                <p style="font-size:28px;font-weight:800;color:#2563eb;line-height:1">{{ selectedPatient.avgDaysBetween || '—' }}</p>
                <p style="font-size:12px;color:#64748b;margin-top:4px">Jrs moy.</p>
              </div>
            </div>

            <!-- Severity bar chart -->
            <p style="font-size:13px;font-weight:600;color:#475569;margin-bottom:12px"><i class="fa-solid fa-chart-bar" style="margin-right:6px"></i> Répartition par sévérité</p>
            <div style="display:flex;flex-direction:column;gap:8px" *ngIf="selectedPatient.totalIncidents > 0">
              <div *ngFor="let sev of severityLevels" style="display:flex;align-items:center;gap:10px">
                <span style="font-size:12px;color:#64748b;width:55px;text-align:right">{{ sev.label }}</span>
                <div style="flex:1;height:22px;background:#f1f5f9;border-radius:6px;overflow:hidden;position:relative">
                  <div style="height:100%;border-radius:6px;transition:width 0.6s ease"
                       [style.width.%]="getPercent(selectedPatient, sev.key)"
                       [style.background]="sev.colorGrad">
                  </div>
                </div>
                <span style="font-size:13px;font-weight:700;width:28px;text-align:right" [style.color]="sev.color">{{ selectedPatient.bySeverity[sev.key] || 0 }}</span>
              </div>
            </div>

            <!-- Send email button (detail panel) -->
            <button (click)="openEmailModal(selectedPatient, $event)"
                    style="margin-top:20px;padding:12px 24px;border-radius:10px;border:none;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all 0.2s">
              <i class="fa-solid fa-envelope"></i>
              Envoyer les statistiques par e-mail
            </button>
          </div>
        </div>
      </div>

      <!-- Patient cards grid -->
      <div *ngIf="!loading && filteredStats.length > 0" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px">
        <div *ngFor="let p of filteredStats"
             (click)="selectedPatient = p"
             style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;cursor:pointer;transition:all 0.25s ease;position:relative"
             class="patient-card">

          <!-- Risk header stripe -->
          <div style="height:4px" [style.background]="'linear-gradient(90deg, ' + riskGradient(p.riskLevel) + ')'"></div>

          <div style="padding:20px 22px">
            <!-- Patient identity row -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <div style="display:flex;align-items:center;gap:12px">
                <div style="width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff"
                     [style.background]="'linear-gradient(135deg, ' + riskGradient(p.riskLevel) + ')'">
                  {{ getInitials(p.patientName) }}
                </div>
                <div>
                  <h3 style="font-size:15px;font-weight:700;color:#1e293b;margin:0">{{ p.patientName }}</h3>
                  <p style="font-size:12px;color:#94a3b8;margin:2px 0 0">Patient #{{ p.patientId }}</p>
                </div>
              </div>
              <span style="padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px"
                    [style.background]="riskBg(p.riskLevel)"
                    [style.color]="riskColor(p.riskLevel)">
                {{ riskLabel(p.riskLevel) }}
              </span>
            </div>

            <!-- Score gauge + mini radial -->
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
              <div style="position:relative;width:64px;height:64px;flex-shrink:0">
                <svg viewBox="0 0 64 64" style="transform:rotate(-90deg);width:64px;height:64px">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#f1f5f9" stroke-width="6"/>
                  <circle cx="32" cy="32" r="26" fill="none"
                          [attr.stroke]="riskColor(p.riskLevel)"
                          stroke-width="6"
                          stroke-linecap="round"
                          [attr.stroke-dasharray]="163.4"
                          [attr.stroke-dashoffset]="163.4 - (163.4 * p.severityScore / 100)"/>
                </svg>
                <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:16px;font-weight:800"
                      [style.color]="riskColor(p.riskLevel)">{{ p.severityScore }}</span>
              </div>
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                  <span style="color:#64748b">Score de gravité</span>
                  <span style="font-weight:700" [style.color]="riskColor(p.riskLevel)">{{ p.severityScore }}/100</span>
                </div>
                <div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden">
                  <div style="height:100%;border-radius:4px;transition:width 0.6s ease"
                       [style.width.%]="p.severityScore"
                       [style.background]="'linear-gradient(90deg, ' + riskGradient(p.riskLevel) + ')'">
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats row -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
              <div style="background:#f8fafc;border-radius:10px;padding:10px 8px;text-align:center;border:1px solid #f1f5f9">
                <p style="font-size:20px;font-weight:800;color:#1e293b;line-height:1">{{ p.totalIncidents }}</p>
                <p style="font-size:11px;color:#94a3b8;margin-top:4px">Total</p>
              </div>
              <div style="background:#fff7ed;border-radius:10px;padding:10px 8px;text-align:center;border:1px solid #fed7aa">
                <p style="font-size:20px;font-weight:800;color:#ea580c;line-height:1">{{ p.activeIncidents }}</p>
                <p style="font-size:11px;color:#94a3b8;margin-top:4px">Actifs</p>
              </div>
              <div style="background:#eff6ff;border-radius:10px;padding:10px 8px;text-align:center;border:1px solid #bfdbfe">
                <p style="font-size:20px;font-weight:800;color:#2563eb;line-height:1">{{ p.avgDaysBetween || '—' }}</p>
                <p style="font-size:11px;color:#94a3b8;margin-top:4px">Jrs moy.</p>
              </div>
            </div>

            <!-- Mini severity breakdown -->
            <div style="margin-top:14px;display:flex;gap:3px;height:6px;border-radius:3px;overflow:hidden" *ngIf="p.totalIncidents > 0">
              <div *ngIf="p.bySeverity['LOW']" style="background:#34d399;transition:flex 0.3s" [style.flex]="p.bySeverity['LOW']"></div>
              <div *ngIf="p.bySeverity['MEDIUM']" style="background:#fbbf24;transition:flex 0.3s" [style.flex]="p.bySeverity['MEDIUM']"></div>
              <div *ngIf="p.bySeverity['HIGH']" style="background:#f97316;transition:flex 0.3s" [style.flex]="p.bySeverity['HIGH']"></div>
              <div *ngIf="p.bySeverity['CRITICAL']" style="background:#ef4444;transition:flex 0.3s" [style.flex]="p.bySeverity['CRITICAL']"></div>
            </div>

            <!-- Send email button -->
            <button (click)="openEmailModal(p, $event)"
                    style="margin-top:14px;width:100%;padding:10px;border-radius:10px;border:1px solid #e2e8f0;background:linear-gradient(135deg,#f8fafc,#f1f5f9);color:#475569;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s"
                    class="email-btn">
              <i class="fa-solid fa-envelope" style="font-size:13px;color:#2563eb"></i>
              Envoyer par e-mail
            </button>
          </div>
        </div>
      </div>

      <!-- No results for filter -->
      <div *ngIf="!loading && stats.length > 0 && filteredStats.length === 0" style="text-align:center;padding:48px;background:#fff;border-radius:16px;border:1px solid #e2e8f0">
        <i class="fa-solid fa-filter-circle-xmark" style="font-size:40px;color:#cbd5e1;margin-bottom:12px"></i>
        <p style="color:#0f172a">Aucun patient ne correspond à vos critères</p>
      </div>

      <!-- Email Modal -->
      <div *ngIf="showEmailModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center"
           (click)="showEmailModal = false">
        <div style="background:#fff;border-radius:16px;padding:32px;width:440px;max-width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.2)" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:10px;display:flex;align-items:center;justify-content:center">
                <i class="fa-solid fa-envelope" style="color:#fff;font-size:16px"></i>
              </div>
              <h3 style="margin:0;font-size:18px;font-weight:700;color:#1e293b">Envoyer les statistiques</h3>
            </div>
            <button (click)="showEmailModal = false" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;padding:4px">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <p style="font-size:14px;color:#64748b;margin-bottom:16px">
            Envoyer le rapport de <strong style="color:#1e293b">{{ emailTargetPatient?.patientName }}</strong> par e-mail
          </p>
          <label style="font-size:13px;font-weight:600;color:#475569;display:block;margin-bottom:6px">Adresse e-mail</label>
          <input class="form-input" type="email" [(ngModel)]="emailAddress" placeholder="exemple@email.com"
                 style="width:100%;margin-bottom:20px;padding:12px 14px;font-size:14px">
          <div *ngIf="emailStatus === 'success'" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px">
            <i class="fa-solid fa-circle-check" style="color:#16a34a;font-size:16px"></i>
            <span style="color:#15803d;font-size:13px;font-weight:600">Statistiques envoyées avec succès !</span>
          </div>
          <div *ngIf="emailStatus === 'error'" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px">
            <i class="fa-solid fa-circle-xmark" style="color:#ef4444;font-size:16px"></i>
            <span style="color:#991b1b;font-size:13px;font-weight:600">Erreur lors de l'envoi. Réessayez.</span>
          </div>
          <div style="display:flex;gap:12px;justify-content:flex-end">
            <button (click)="showEmailModal = false"
                    style="padding:10px 22px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;color:#64748b;font-weight:600;font-size:14px;cursor:pointer">
              Annuler
            </button>
            <button (click)="sendEmail()"
                    [disabled]="sendingEmail || !emailAddress"
                    style="padding:10px 22px;border-radius:10px;border:none;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:8px;opacity:1;transition:opacity 0.2s"
                    [style.opacity]="sendingEmail || !emailAddress ? '0.6' : '1'">
              <i class="fa-solid fa-paper-plane" *ngIf="!sendingEmail"></i>
              <div *ngIf="sendingEmail" style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite"></div>
              {{ sendingEmail ? 'Envoi...' : 'Envoyer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
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

    .patient-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
      border-color: #c7d2fe;
    }
    .email-btn:hover {
      background: linear-gradient(135deg, #2563eb, #7c3aed) !important;
      color: #fff !important;
      border-color: transparent !important;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class PatientStatsPage implements OnInit {
  stats: PatientStats[] = [];
  filteredStats: PatientStats[] = [];
  loading = true;
  selectedPatient: PatientStats | null = null;
  searchQuery = '';
  riskFilter = '';

  totalIncidentsAll = 0;
  criticalCount = 0;
  avgScore = 0;

  // Email modal state
  showEmailModal = false;
  emailTargetPatient: PatientStats | null = null;
  emailAddress = '';
  sendingEmail = false;
  emailStatus: 'idle' | 'success' | 'error' = 'idle';

  severityLevels = [
    { key: 'CRITICAL', label: 'Critique', color: '#ef4444', colorGrad: 'linear-gradient(90deg,#ef4444,#dc2626)' },
    { key: 'HIGH', label: 'Élevé', color: '#f97316', colorGrad: 'linear-gradient(90deg,#f97316,#ea580c)' },
    { key: 'MEDIUM', label: 'Moyen', color: '#eab308', colorGrad: 'linear-gradient(90deg,#fbbf24,#eab308)' },
    { key: 'LOW', label: 'Faible', color: '#22c55e', colorGrad: 'linear-gradient(90deg,#34d399,#22c55e)' },
  ];

  constructor(private incidentService: IncidentIntegrationService) {}

  ngOnInit(): void {
    this.incidentService.getPatientStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.filteredStats = data;
        this.totalIncidentsAll = data.reduce((s, p) => s + p.totalIncidents, 0);
        this.criticalCount = data.filter(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').length;
        this.avgScore = data.length > 0 ? Math.round(data.reduce((s, p) => s + p.severityScore, 0) / data.length) : 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterStats(): void {
    this.filteredStats = this.stats.filter(p => {
      const matchSearch = !this.searchQuery || p.patientName.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchRisk = !this.riskFilter || p.riskLevel === this.riskFilter;
      return matchSearch && matchRisk;
    });
  }

  getPercent(p: PatientStats, key: string): number {
    if (!p.totalIncidents) return 0;
    return ((p.bySeverity[key] || 0) / p.totalIncidents) * 100;
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  riskGradient(risk: string): string {
    switch (risk) {
      case 'CRITICAL': return '#ef4444, #991b1b';
      case 'HIGH':     return '#f97316, #c2410c';
      case 'MODERATE': return '#eab308, #a16207';
      default:         return '#22c55e, #15803d';
    }
  }

  riskBg(risk: string): string {
    switch (risk) {
      case 'CRITICAL': return '#fef2f2';
      case 'HIGH':     return '#fff7ed';
      case 'MODERATE': return '#fefce8';
      default:         return '#f0fdf4';
    }
  }

  riskColor(risk: string): string {
    switch (risk) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH':     return '#f97316';
      case 'MODERATE': return '#eab308';
      default:         return '#22c55e';
    }
  }

  riskLabel(risk: string): string {
    switch (risk) {
      case 'CRITICAL': return 'Critique';
      case 'HIGH':     return 'Élevé';
      case 'MODERATE': return 'Modéré';
      default:         return 'Faible';
    }
  }

  openEmailModal(patient: PatientStats, event: Event): void {
    event.stopPropagation();
    this.emailTargetPatient = patient;
    this.emailAddress = '';
    this.emailStatus = 'idle';
    this.sendingEmail = false;
    this.showEmailModal = true;
  }

  sendEmail(): void {
    if (!this.emailTargetPatient || !this.emailAddress) return;
    this.sendingEmail = true;
    this.emailStatus = 'idle';
    this.incidentService.sendPatientStatsByEmail(this.emailTargetPatient.patientId, this.emailAddress).subscribe({
      next: () => {
        this.sendingEmail = false;
        this.emailStatus = 'success';
        setTimeout(() => {
          this.showEmailModal = false;
          this.emailStatus = 'idle';
        }, 2000);
      },
      error: () => {
        this.sendingEmail = false;
        this.emailStatus = 'error';
      }
    });
  }
}
