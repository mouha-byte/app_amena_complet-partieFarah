import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GameResultService } from '../../services/game-result.service';
import { QuizService } from '../../services/quiz.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-off-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any;
  stats: any = {};
  recentResults: any[] = [];
  loading = true;

  constructor(
    private auth: AuthService,
    private gameResult: GameResultService,
    private quiz: QuizService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.user = this.auth.currentUser;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const role = this.user?.role;

    // Load quiz count
    this.quiz.getQuizzes().subscribe({
      next: (q: any) => { this.stats.totalQuizzes = q?.length || 0; this.cdr.detectChanges(); },
      error: () => { this.stats.totalQuizzes = 0; this.cdr.detectChanges(); }
    });

    // Load photo count
    this.http.get<any[]>('http://localhost:8085/api/photo-activities').subscribe({
      next: (p) => { this.stats.totalPhotos = p?.length || 0; this.cdr.detectChanges(); },
      error: () => { this.stats.totalPhotos = 0; this.cdr.detectChanges(); }
    });

    // Load game results
    this.gameResult.getAllResults().subscribe({
      next: (results: any[]) => {
        const filtered = role === 'PATIENT'
          ? results.filter(r => r.patientId === this.user.id)
          : results;
        this.stats.totalResults = filtered.length;
        this.stats.avgScore = filtered.length
          ? Math.round(filtered.reduce((s, r) => s + (r.weightedScore || 0), 0) / filtered.length)
          : 0;
        this.stats.criticalCount = filtered.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH').length;
        this.recentResults = filtered.slice(-5).reverse();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });

    // Load user count for admins
    if (role === 'ADMIN') {
      this.http.get<any[]>('http://localhost:8086/users').subscribe({
        next: (u) => { this.stats.totalUsers = u?.length || 0; this.cdr.detectChanges(); },
        error: () => { this.stats.totalUsers = 0; this.cdr.detectChanges(); }
      });
    }
  }

  getRiskClass(level: string): string {
    const m: any = { LOW: 'risk-low', MEDIUM: 'risk-med', HIGH: 'risk-high', CRITICAL: 'risk-crit' };
    return m[level] || '';
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }
}
