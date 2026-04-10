import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentService } from '../../core/services/incident.service';
import { Incident } from '../../core/models/incident.model';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  incidents: Incident[];
  color: string;
  isToday: boolean;
}

@Component({
  selector: 'app-incident-calendar-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width:1100px;margin:0 auto">
      <!-- Hero Header -->
      <div style="background:linear-gradient(135deg,#1e3a5f 0%,#1e40af 50%,#7c3aed 100%);border-radius:16px;padding:32px;margin-bottom:28px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:rgba(255,255,255,0.06);border-radius:50%"></div>
        <div style="position:absolute;bottom:-60px;left:20%;width:300px;height:300px;background:rgba(255,255,255,0.04);border-radius:50%"></div>
        <div style="position:relative;z-index:1">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">
            <div style="width:48px;height:48px;background:rgba(255,255,255,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center">
              <i class="fa-solid fa-calendar-days" style="font-size:22px;color:#fff"></i>
            </div>
            <div>
              <h1 style="font-size:24px;font-weight:800;color:#fff;margin:0">Calendrier des incidents</h1>
              <p style="font-size:14px;color:rgba(255,255,255,0.7);margin:0">Visualisez les incidents jour par jour</p>
            </div>
          </div>

          <!-- Summary + Legend -->
          <div style="display:flex;gap:16px;margin-top:20px;flex-wrap:wrap;align-items:center">
            <div style="background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border-radius:12px;padding:14px 22px;min-width:120px">
              <p style="font-size:28px;font-weight:800;color:#fff">{{ monthIncidentCount }}</p>
              <p style="font-size:12px;color:rgba(255,255,255,0.7)">Ce mois</p>
            </div>
            <div style="background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border-radius:12px;padding:14px 22px;min-width:120px">
              <p style="font-size:28px;font-weight:800;color:#fff">{{ daysWithIncidents }}</p>
              <p style="font-size:12px;color:rgba(255,255,255,0.7)">Jours touchés</p>
            </div>

            <!-- Legend pills -->
            <div style="display:flex;gap:10px;margin-left:auto;flex-wrap:wrap">
              <span style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.12);border-radius:20px;padding:6px 14px;font-size:12px;color:rgba(255,255,255,0.9)">
                <span style="width:10px;height:10px;border-radius:50%;background:#34d399;display:inline-block"></span> Aucun
              </span>
              <span style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.12);border-radius:20px;padding:6px 14px;font-size:12px;color:rgba(255,255,255,0.9)">
                <span style="width:10px;height:10px;border-radius:50%;background:#fbbf24;display:inline-block"></span> 1-2
              </span>
              <span style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.12);border-radius:20px;padding:6px 14px;font-size:12px;color:rgba(255,255,255,0.9)">
                <span style="width:10px;height:10px;border-radius:50%;background:#ef4444;display:inline-block"></span> 3+
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar Container -->
      <div style="background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:1px solid #e2e8f0;overflow:hidden">
        <!-- Month navigation -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;background:#f8fafc;border-bottom:1px solid #e2e8f0">
          <button (click)="prevMonth()"
                  style="width:40px;height:40px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;color:#475569;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s"
                  class="cal-nav-btn">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <div style="text-align:center">
            <h2 style="font-size:20px;font-weight:800;color:#1e293b;margin:0">{{ monthLabel }}</h2>
            <button (click)="goToToday()" style="font-size:11px;color:#6366f1;background:none;border:none;cursor:pointer;font-weight:600;margin-top:2px"
                    *ngIf="!isCurrentMonthView">
              <i class="fa-solid fa-arrow-rotate-left" style="margin-right:4px;font-size:10px"></i> Aujourd'hui
            </button>
          </div>
          <button (click)="nextMonth()"
                  style="width:40px;height:40px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;color:#475569;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s"
                  class="cal-nav-btn">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <!-- Weekday headers -->
        <div style="display:grid;grid-template-columns:repeat(7,1fr);background:#f8fafc;border-bottom:1px solid #e2e8f0">
          <div *ngFor="let d of weekDays"
               style="padding:10px;text-align:center;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px">
            {{ d }}
          </div>
        </div>

        <!-- Calendar grid -->
        <div style="display:grid;grid-template-columns:repeat(7,1fr)">
          <div *ngFor="let cell of calendarDays"
               (click)="cell.isCurrentMonth && cell.incidents.length > 0 ? selectDay(cell) : null"
               style="min-height:90px;padding:8px;border-bottom:1px solid #f1f5f9;border-right:1px solid #f1f5f9;transition:all 0.2s;position:relative"
               [style.background]="cell.isToday ? '#eff6ff' : (cell.isCurrentMonth ? '#fff' : '#fafbfc')"
               [style.cursor]="cell.isCurrentMonth && cell.incidents.length > 0 ? 'pointer' : 'default'"
               class="cal-day-cell"
               [class.cal-day-active]="cell.isCurrentMonth && cell.incidents.length > 0"
               [class.cal-day-selected]="selectedDay === cell">

            <!-- Day number -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:14px;font-weight:600;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px"
                    [style.color]="cell.isToday ? '#fff' : (cell.isCurrentMonth ? '#1e293b' : '#cbd5e1')"
                    [style.background]="cell.isToday ? '#2563eb' : 'transparent'">
                {{ cell.day }}
              </span>
              <span *ngIf="cell.isCurrentMonth && cell.incidents.length > 0"
                    style="min-width:24px;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;padding:0 6px"
                    [style.background]="colorBg(cell.color)">
                {{ cell.incidents.length }}
              </span>
            </div>

            <!-- Severity dots -->
            <div *ngIf="cell.isCurrentMonth && cell.incidents.length > 0"
                 style="display:flex;flex-wrap:wrap;gap:3px">
              <span *ngFor="let inc of cell.incidents.slice(0, 6)"
                    style="width:8px;height:8px;border-radius:50%;display:block"
                    [style.background]="severityDotColor(inc.severityLevel)">
              </span>
              <span *ngIf="cell.incidents.length > 6"
                    style="font-size:10px;color:#94a3b8;line-height:8px">+{{ cell.incidents.length - 6 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Day detail panel -->
      <div *ngIf="selectedDay" style="margin-top:24px;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:1px solid #e2e8f0;overflow:hidden">
        <!-- Detail header -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 28px;border-bottom:1px solid #e2e8f0;background:linear-gradient(135deg,#f8fafc,#eff6ff)">
          <div style="display:flex;align-items:center;gap:14px">
            <div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px"
                 [style.background]="colorBg(selectedDay.color)">
              <i class="fa-solid fa-calendar-day"></i>
            </div>
            <div>
              <h3 style="font-size:18px;font-weight:700;color:#1e293b;margin:0;text-transform:capitalize">
                {{ selectedDay.date | date:'EEEE d MMMM yyyy':'':'fr' }}
              </h3>
              <p style="font-size:13px;color:#64748b;margin:2px 0 0">{{ selectedDay.incidents.length }} incident(s) enregistré(s)</p>
            </div>
          </div>
          <button (click)="selectedDay = null"
                  style="width:36px;height:36px;background:#f1f5f9;border:none;border-radius:50%;color:#64748b;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s"
                  class="cal-close-btn">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Incident cards -->
        <div style="padding:20px;display:flex;flex-direction:column;gap:14px">
          <div *ngFor="let inc of selectedDay.incidents"
               style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:18px;transition:all 0.2s"
               class="incident-detail-card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between">
              <div style="flex:1">
                <!-- Badges row -->
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:10px">
                  <span style="padding:4px 12px;border-radius:8px;font-size:12px;font-weight:700;color:#fff"
                        [style.background]="severityDotColor(inc.severityLevel)">
                    {{ severityLabel(inc.severityLevel) }}
                  </span>
                  <span style="padding:4px 12px;border-radius:8px;font-size:12px;font-weight:600"
                        [style.background]="statusBg(inc.status)"
                        [style.color]="statusColor(inc.status)">
                    <i [class]="statusIcon(inc.status)" style="margin-right:4px;font-size:10px"></i>
                    {{ statusLabel(inc.status) }}
                  </span>
                  <span *ngIf="inc.type?.name"
                        style="padding:4px 12px;border-radius:8px;font-size:12px;font-weight:600;background:#f1f5f9;color:#475569">
                    <i class="fa-solid fa-tag" style="margin-right:4px;font-size:10px;color:#94a3b8"></i>
                    {{ inc.type.name }}
                  </span>
                </div>

                <!-- Description -->
                <p style="font-size:14px;color:#475569;line-height:1.5;margin:0">{{ inc.description || 'Pas de description' }}</p>

                <!-- Meta row -->
                <div style="display:flex;gap:16px;margin-top:10px;flex-wrap:wrap">
                  <span style="font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:5px">
                    <i class="fa-solid fa-user" style="font-size:10px"></i> Patient #{{ inc.patientId }}
                  </span>
                  <span style="font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:5px">
                    <i class="fa-solid fa-gauge" style="font-size:10px"></i> Score: {{ inc.computedScore ?? 'N/A' }}
                  </span>
                </div>
              </div>
              <span style="font-size:12px;color:#cbd5e1;font-weight:600;white-space:nowrap;margin-left:12px">#{{ inc.id }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cal-nav-btn:hover { background: #f1f5f9 !important; border-color: #c7d2fe !important; color: #4f46e5 !important; }
    .cal-day-active:hover { background: #f1f5f9 !important; }
    .cal-day-selected { box-shadow: inset 0 0 0 2px #6366f1; background: #eef2ff !important; }
    .cal-close-btn:hover { background: #e2e8f0 !important; color: #1e293b !important; }
    .incident-detail-card:hover { border-color: #c7d2fe; background: #fff !important; box-shadow: 0 2px 12px rgba(99,102,241,0.08); }
  `]
})
export class IncidentCalendarPage implements OnInit {
  allIncidents: Incident[] = [];
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  monthLabel = '';
  monthIncidentCount = 0;
  daysWithIncidents = 0;

  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  get isCurrentMonthView(): boolean {
    const now = new Date();
    return this.currentYear === now.getFullYear() && this.currentMonth === now.getMonth();
  }

  constructor(private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.incidentService.getIncidentHistory().subscribe({
      next: (data) => {
        this.allIncidents = data;
        this.buildCalendar();
      },
      error: () => this.buildCalendar()
    });
  }

  buildCalendar(): void {
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    this.monthLabel = `${monthNames[this.currentMonth]} ${this.currentYear}`;

    const today = new Date();
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: CalendarDay[] = [];

    const prevMonthLast = new Date(this.currentYear, this.currentMonth, 0);
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(this.currentYear, this.currentMonth - 1, prevMonthLast.getDate() - i);
      days.push({ date: d, day: d.getDate(), isCurrentMonth: false, incidents: [], color: 'none', isToday: false });
    }

    let totalMonthIncidents = 0;
    let touchedDays = 0;

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.currentYear, this.currentMonth, d);
      const dayIncidents = this.getIncidentsForDate(date);
      const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      if (dayIncidents.length > 0) { totalMonthIncidents += dayIncidents.length; touchedDays++; }
      days.push({
        date,
        day: d,
        isCurrentMonth: true,
        incidents: dayIncidents,
        color: this.getColor(dayIncidents.length),
        isToday
      });
    }

    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(this.currentYear, this.currentMonth + 1, i);
        days.push({ date: d, day: d.getDate(), isCurrentMonth: false, incidents: [], color: 'none', isToday: false });
      }
    }

    this.calendarDays = days;
    this.monthIncidentCount = totalMonthIncidents;
    this.daysWithIncidents = touchedDays;
    this.selectedDay = null;
  }

  getIncidentsForDate(date: Date): Incident[] {
    return this.allIncidents.filter(i => {
      if (!i.incidentDate) return false;
      const d = new Date(i.incidentDate);
      return d.getFullYear() === date.getFullYear()
          && d.getMonth() === date.getMonth()
          && d.getDate() === date.getDate();
    });
  }

  getColor(count: number): string {
    if (count === 0) return 'green';
    if (count <= 2) return 'orange';
    return 'red';
  }

  colorBg(color: string): string {
    switch (color) {
      case 'red':    return '#ef4444';
      case 'orange': return '#f59e0b';
      default:       return '#22c55e';
    }
  }

  severityDotColor(level: string): string {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH':     return '#f97316';
      case 'MEDIUM':   return '#fbbf24';
      default:         return '#34d399';
    }
  }

  statusBg(status: string): string {
    switch (status) {
      case 'OPEN':        return '#dbeafe';
      case 'IN_PROGRESS': return '#fef3c7';
      case 'RESOLVED':    return '#d1fae5';
      default:            return '#f1f5f9';
    }
  }

  statusColor(status: string): string {
    switch (status) {
      case 'OPEN':        return '#2563eb';
      case 'IN_PROGRESS': return '#d97706';
      case 'RESOLVED':    return '#059669';
      default:            return '#64748b';
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'OPEN':        return 'fa-solid fa-circle';
      case 'IN_PROGRESS': return 'fa-solid fa-spinner';
      case 'RESOLVED':    return 'fa-solid fa-circle-check';
      default:            return 'fa-solid fa-circle-question';
    }
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay = day;
  }

  goToToday(): void {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.buildCalendar();
  }

  prevMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.buildCalendar();
  }

  severityLabel(level: string): string {
    switch (level) {
      case 'LOW': return 'Faible';
      case 'MEDIUM': return 'Moyen';
      case 'HIGH': return 'Élevé';
      case 'CRITICAL': return 'Critique';
      default: return level;
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'OPEN': return 'Ouvert';
      case 'IN_PROGRESS': return 'En cours';
      case 'RESOLVED': return 'Résolu';
      default: return status;
    }
  }
}
