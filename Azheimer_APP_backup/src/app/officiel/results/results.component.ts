import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameResultService } from '../../services/game-result.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-off-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './results.component.html',
  styleUrls: ['../quiz-management/quiz-management.component.css', './results.component.css']
})
export class ResultsComponent implements OnInit {
  results: any[] = [];
  filtered: any[] = [];
  loading = true;
  user: any;
  filterRisk = '';
  filterDiff = '';
  searchText = '';

  // -- Risk overview per patient --
  patientSummaries: any[] = [];
  activeTab: 'results' | 'risk' = 'results';
  sendingEmail: { [id: number]: boolean } = {};
  emailMsg: { [id: number]: string } = {};

  constructor(private grSvc: GameResultService, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.user = this.auth.currentUser;
    this.load();
  }

  load() {
    this.loading = true;
    this.grSvc.getAllResults().subscribe({
      next: (d: any) => {
        let data = d || [];
        if (this.user?.role === 'PATIENT') {
          data = data.filter((r: any) => r.patientId === this.user.id);
        }
        this.results = data;
        this.applyFilter();
        this.buildPatientSummaries();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  /** Build per-patient aggregated summaries from result data */
  buildPatientSummaries() {
    const map = new Map<number, any>();
    for (const r of this.results) {
      const pid = r.patientId;
      if (!map.has(pid)) {
        map.set(pid, {
          patientId: pid,
          patientName: r.patientName || 'Patient #' + pid,
          patientEmail: r.patientEmail || '',
          results: [],
          totalGames: 0,
          avgScore: 0,
          lastRisk: '',
          criticalCount: 0,
          highCount: 0,
          lastDate: ''
        });
      }
      const s = map.get(pid)!;
      s.results.push(r);
      s.totalGames++;
      if (r.riskLevel === 'CRITICAL') s.criticalCount++;
      if (r.riskLevel === 'HIGH') s.highCount++;
    }
    map.forEach(s => {
      s.avgScore = Math.round(s.results.reduce((a: number, r: any) => a + (r.weightedScore || 0), 0) / s.totalGames);
      // Sort by date desc
      s.results.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      s.lastRisk = s.results[0]?.riskLevel || 'N/A';
      s.lastDate = s.results[0]?.completedAt || '';
      // Calculate trend from last 3 results
      const recent = s.results.slice(0, 3).map((r: any) => r.weightedScore || 0);
      if (recent.length >= 2) {
        const diff = recent[0] - recent[recent.length - 1];
        s.trend = diff > 5 ? 'IMPROVING' : diff < -5 ? 'DECLINING' : 'STABLE';
      } else {
        s.trend = 'STABLE';
      }
    });
    this.patientSummaries = Array.from(map.values());
    // Sort: critical first, then by avg score ascending
    this.patientSummaries.sort((a, b) => {
      const pri: any = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, 'N/A': 4 };
      const pa = pri[a.lastRisk] ?? 4, pb = pri[b.lastRisk] ?? 4;
      if (pa !== pb) return pa - pb;
      return a.avgScore - b.avgScore;
    });
  }

  applyFilter() {
    this.filtered = this.results.filter(r => {
      if (this.filterRisk && r.riskLevel !== this.filterRisk) return false;
      if (this.filterDiff && r.difficulty !== this.filterDiff) return false;
      if (this.searchText) {
        const s = this.searchText.toLowerCase();
        return (r.patientName || '').toLowerCase().includes(s) ||
               (r.activityTitle || '').toLowerCase().includes(s);
      }
      return true;
    });
  }

  delete(id: number) {
    if (!confirm('Supprimer ce résultat ?')) return;
    this.grSvc.deleteResult(id).subscribe({ next: () => this.load(), error: () => this.cdr.detectChanges() });
  }

  sendAlert(resultId: number) {
    this.sendingEmail[resultId] = true;
    this.emailMsg[resultId] = '';
    this.cdr.detectChanges();
    this.grSvc.sendAlert(resultId).subscribe({
      next: (res: any) => {
        this.sendingEmail[resultId] = false;
        this.emailMsg[resultId] = res.sent ? '✅ Email envoyé' : '❌ Échec';
        this.cdr.detectChanges();
        setTimeout(() => { this.emailMsg[resultId] = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: () => {
        this.sendingEmail[resultId] = false;
        this.emailMsg[resultId] = '❌ Erreur';
        this.cdr.detectChanges();
        setTimeout(() => { this.emailMsg[resultId] = ''; this.cdr.detectChanges(); }, 4000);
      }
    });
  }

  getRiskClass(l: string) {
    return { LOW: 'risk-low', MEDIUM: 'risk-med', HIGH: 'risk-high', CRITICAL: 'risk-crit' }[l] || '';
  }

  getRiskIcon(l: string) {
    return { LOW: '✅', MEDIUM: '⚠️', HIGH: '🔶', CRITICAL: '🚨' }[l] || '❓';
  }

  getTrendIcon(t: string) {
    return { IMPROVING: '📈', DECLINING: '📉', STABLE: '➡️' }[t] || '➡️';
  }

  getTrendLabel(t: string) {
    return { IMPROVING: 'En progrès', DECLINING: 'En baisse', STABLE: 'Stable' }[t] || t;
  }

  get avgScore() {
    if (!this.filtered.length) return 0;
    return Math.round(this.filtered.reduce((s, r) => s + (r.weightedScore || 0), 0) / this.filtered.length);
  }

  get criticalPatients() { return this.patientSummaries.filter(p => p.lastRisk === 'CRITICAL' || p.lastRisk === 'HIGH').length; }
}
