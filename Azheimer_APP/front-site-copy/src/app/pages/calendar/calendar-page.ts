import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <div>
          <h1 style="font-size:24px;font-weight:700">Calendrier</h1>
          <p style="color:#64748b;font-size:14px">Rendez-vous et activités</p>
        </div>
        <button class="btn-primary-alz" (click)="openForm()">
          <i class="fa-solid fa-plus"></i> Nouveau rendez-vous
        </button>
      </div>

      <!-- Calendar header -->
      <div class="card-alzcare" style="margin-bottom:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <button class="btn-secondary-alz" style="padding:8px 16px" (click)="prevMonth()"><i class="fa-solid fa-chevron-left"></i></button>
          <h2 style="font-size:18px;font-weight:600">{{ getMonthName() }} {{ year }}</h2>
          <button class="btn-secondary-alz" style="padding:8px 16px" (click)="nextMonth()"><i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <!-- Days grid -->
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">
          @for (d of dayNames; track d) {
            <div style="text-align:center;font-size:12px;font-weight:600;color:#64748b;padding:8px">{{ d }}</div>
          }
          @for (day of calendarDays; track $index) {
            <div style="min-height:80px;border:1px solid #f1f5f9;border-radius:6px;padding:4px;cursor:pointer;font-size:13px"
                 [style.background]="day.isToday ? '#eff6ff' : '#fff'"
                 (click)="day.num ? selectDate(day.num) : null">
              @if (day.num) {
                <div style="font-weight:500;margin-bottom:4px" [style.color]="day.isToday ? '#3b82f6' : '#374151'">{{ day.num }}</div>
                @for (appt of getAppointments(day.num); track appt.id) {
                  <div style="font-size:11px;padding:2px 6px;border-radius:4px;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                       [style.background]="getTypeColor(appt.type)" [style.color]="'#fff'"
                       (click)="editAppt(appt);$event.stopPropagation()">
                    {{ appt.title }}
                  </div>
                }
              }
            </div>
          }
        </div>
      </div>

      <!-- Upcoming -->
      <div class="card-alzcare">
        <h2 style="font-size:16px;font-weight:600;margin-bottom:16px">Prochains rendez-vous</h2>
        @if (upcoming.length === 0) {
          <p style="color:#94a3b8;text-align:center;padding:24px">Aucun rendez-vous à venir</p>
        } @else {
          @for (a of upcoming; track a.id) {
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid #f1f5f9">
              <div>
                <span style="font-weight:500">{{ a.title }}</span>
                <span style="font-size:12px;color:#94a3b8;margin-left:8px">{{ a.startDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div style="display:flex;gap:8px">
                <button style="background:none;border:none;color:#3b82f6;cursor:pointer" (click)="editAppt(a)"><i class="fa-solid fa-pen"></i></button>
                <button style="background:none;border:none;color:#ef4444;cursor:pointer" (click)="deleteAppt(a.id)"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Form modal -->
      @if (showForm) {
        <div class="modal-overlay" (click)="showForm=false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2 style="font-size:18px;font-weight:700;margin-bottom:20px">{{ editing ? 'Modifier' : 'Nouveau' }} rendez-vous</h2>
            <div class="form-group">
              <label class="form-label">Titre</label>
              <input class="form-input" [(ngModel)]="form.title">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="form-group">
                <label class="form-label">Début</label>
                <input class="form-input" type="datetime-local" [(ngModel)]="form.startDate">
              </div>
              <div class="form-group">
                <label class="form-label">Type</label>
                <select class="form-select" [(ngModel)]="form.type">
                  <option value="VISIT">Visite</option>
                  <option value="ACTIVITY">Activité</option>
                  <option value="MEDICAL">Médical</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-input" [(ngModel)]="form.description"></textarea>
            </div>
            <div style="display:flex;gap:12px;margin-top:16px">
              <button class="btn-primary-alz" (click)="saveAppt()">{{ editing ? 'Modifier' : 'Créer' }}</button>
              <button class="btn-secondary-alz" (click)="showForm=false">Annuler</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CalendarPage implements OnInit {
  appointments: any[] = [];
  upcoming: any[] = [];
  month = new Date().getMonth();
  year = new Date().getFullYear();
  dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  calendarDays: { num: number; isToday: boolean }[] = [];
  showForm = false;
  editing = false;
  editId = 0;
  form: any = { title: '', startDate: '', type: 'VISIT', description: '' };

  constructor(private apptService: AppointmentService, private authService: AuthService) {}

  ngOnInit(): void {
    this.load();
    this.buildCalendar();
  }

  load(): void {
    this.apptService.getAll().subscribe(list => {
      this.appointments = list;
      const now = new Date();
      this.upcoming = list.filter(a => new Date(a.startDate) >= now).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).slice(0, 5);
    });
  }

  buildCalendar(): void {
    const firstDay = new Date(this.year, this.month, 1);
    const lastDay = new Date(this.year, this.month + 1, 0);
    let startDow = firstDay.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // Convert to Mon=0

    const today = new Date();
    this.calendarDays = [];
    for (let i = 0; i < startDow; i++) this.calendarDays.push({ num: 0, isToday: false });
    for (let d = 1; d <= lastDay.getDate(); d++) {
      this.calendarDays.push({
        num: d,
        isToday: d === today.getDate() && this.month === today.getMonth() && this.year === today.getFullYear()
      });
    }
  }

  getMonthName(): string {
    return new Date(this.year, this.month).toLocaleDateString('fr-FR', { month: 'long' });
  }

  prevMonth(): void { if (this.month === 0) { this.month = 11; this.year--; } else this.month--; this.buildCalendar(); }
  nextMonth(): void { if (this.month === 11) { this.month = 0; this.year++; } else this.month++; this.buildCalendar(); }

  getAppointments(day: number): any[] {
    const dateStr = `${this.year}-${String(this.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return this.appointments.filter(a => a.startDate?.startsWith(dateStr));
  }

  selectDate(day: number): void {
    const dateStr = `${this.year}-${String(this.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:00`;
    this.form = { title: '', startDate: dateStr, type: 'VISIT', description: '' };
    this.editing = false;
    this.showForm = true;
  }

  openForm(): void {
    this.editing = false;
    const now = new Date();
    this.form = { title: '', startDate: now.toISOString().slice(0, 16), type: 'VISIT', description: '' };
    this.showForm = true;
  }

  editAppt(a: any): void {
    this.editing = true;
    this.editId = a.id;
    const dt = a.startDate ? a.startDate.slice(0, 16) : '';
    this.form = { title: a.title, startDate: dt, type: a.type, description: a.description || '' };
    this.showForm = true;
  }

  saveAppt(): void {
    const payload: any = { ...this.form };
    // Ensure startDate is full ISO datetime
    if (payload.startDate && payload.startDate.length === 10) {
      payload.startDate = payload.startDate + 'T09:00:00';
    } else if (payload.startDate && payload.startDate.length === 16) {
      payload.startDate = payload.startDate + ':00';
    }
    // Add user context
    const userId = this.authService.getUserId();
    const role = this.authService.getRole();
    if (role === 'CAREGIVER') {
      payload.caregiverId = userId;
    } else if (role === 'PATIENT') {
      payload.patientId = userId;
    }
    if (this.editing) {
      this.apptService.update(this.editId, payload).subscribe(() => { this.showForm = false; this.load(); });
    } else {
      this.apptService.create(payload).subscribe(() => { this.showForm = false; this.load(); });
    }
  }

  deleteAppt(id: number): void {
    if (!confirm('Supprimer ?')) return;
    this.apptService.delete(id).subscribe(() => this.load());
  }

  getTypeColor(type: string): string {
    const m: Record<string, string> = { VISIT: '#3b82f6', ACTIVITY: '#10b981', MEDICAL: '#ef4444', OTHER: '#8b5cf6' };
    return m[type] || '#64748b';
  }
}
