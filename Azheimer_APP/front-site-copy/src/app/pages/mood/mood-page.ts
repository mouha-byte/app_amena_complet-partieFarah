import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MoodService } from '../../core/services/mood.service';

@Component({
  selector: 'app-mood-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:800px">
      <h1 style="font-size:24px;font-weight:700;margin-bottom:4px">Suivi de l'humeur</h1>
      <p style="color:#64748b;font-size:14px;margin-bottom:24px">Suivre l'état émotionnel du patient au fil du temps</p>

      <!-- New entry form -->
      <div class="card-alzcare" style="margin-bottom:24px">
        <h2 style="font-size:16px;font-weight:600;margin-bottom:16px">Nouvel enregistrement</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr 2fr;gap:12px;align-items:end">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Score (1-5)</label>
            <div style="display:flex;gap:4px">
              @for (n of [1,2,3,4,5]; track n) {
                <button
                  style="width:40px;height:40px;border-radius:8px;border:2px solid;font-size:16px;font-weight:600;cursor:pointer"
                  [style.background]="score === n ? getMoodColor(n) : '#fff'"
                  [style.color]="score === n ? '#fff' : getMoodColor(n)"
                  [style.border-color]="getMoodColor(n)"
                  (click)="score=n">
                  {{ n }}
                </button>
              }
            </div>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Date</label>
            <input class="form-input" type="date" [(ngModel)]="moodDate">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Note (optionnel)</label>
            <div style="display:flex;gap:8px">
              <input class="form-input" [(ngModel)]="note" placeholder="Observation...">
              <button class="btn-primary-alz" (click)="addEntry()">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      @if (success) {
        <div class="alert-success" style="margin-bottom:16px">Humeur enregistrée !</div>
      }

      <!-- Mood Chart (simple visual) -->
      <div class="card-alzcare" style="margin-bottom:24px">
        <h2 style="font-size:16px;font-weight:600;margin-bottom:16px">Évolution récente</h2>
        @if (entries.length === 0) {
          <p style="color:#94a3b8;text-align:center;padding:24px">Aucun enregistrement</p>
        } @else {
          <div style="display:flex;align-items:flex-end;gap:4px;height:120px;padding:0 8px">
            @for (e of entries.slice(-20); track e.id) {
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
                <div [style.height.px]="e.score * 20" [style.background]="getMoodColor(e.score)" style="width:100%;max-width:32px;border-radius:4px 4px 0 0;min-height:4px"></div>
                <span style="font-size:10px;color:#94a3b8">{{ e.score }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- History table -->
      <div class="card-alzcare" style="padding:0;overflow:hidden">
        <table class="table-alzcare">
          <thead>
            <tr>
              <th>Date</th>
              <th>Score</th>
              <th>Humeur</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (e of entries; track e.id) {
              <tr>
                <td>{{ e.date | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span style="font-weight:600;font-size:16px" [style.color]="getMoodColor(e.score)">{{ e.score }}/5</span>
                </td>
                <td>{{ getMoodLabel(e.score) }}</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ e.note || '-' }}</td>
                <td>
                  <button style="background:none;border:none;color:#ef4444;cursor:pointer" (click)="deleteEntry(e.id)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class MoodPage implements OnInit {
  entries: any[] = [];
  score = 3;
  moodDate = '';
  note = '';
  success = false;
  patientId = 0;

  constructor(private moodService: MoodService, private authService: AuthService) {}

  ngOnInit(): void {
    this.patientId = this.authService.getUserId() || 0;
    this.moodDate = new Date().toISOString().slice(0, 10);
    this.load();
  }

  load(): void {
    if (this.patientId) {
      this.moodService.getByPatient(this.patientId).subscribe(e => this.entries = e);
    }
  }

  addEntry(): void {
    this.moodService.create({ patientId: this.patientId, score: this.score, date: this.moodDate, note: this.note }).subscribe(() => {
      this.success = true;
      this.note = '';
      this.score = 3;
      this.load();
      setTimeout(() => this.success = false, 2000);
    });
  }

  deleteEntry(id: number): void {
    if (!confirm('Supprimer ?')) return;
    this.moodService.delete(id).subscribe(() => this.load());
  }

  getMoodColor(score: number): string {
    const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
    return colors[score] || '#94a3b8';
  }

  getMoodLabel(score: number): string {
    const labels = ['', 'Très bas', 'Bas', 'Neutre', 'Bon', 'Très bon'];
    return labels[score] || '-';
  }
}
