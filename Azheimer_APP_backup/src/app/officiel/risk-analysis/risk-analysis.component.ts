import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameResultService } from '../../services/game-result.service';

@Component({
  selector: 'app-off-risk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './risk-analysis.component.html',
  styleUrls: ['../quiz-management/quiz-management.component.css', './risk-analysis.component.css']
})
export class RiskAnalysisComponent implements OnInit {
  patientId = 1;
  analysis: any = null;
  loading = false;
  error = '';

  constructor(private grSvc: GameResultService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  analyze() {
    this.loading = true;
    this.error = '';
    this.analysis = null;
    this.grSvc.getRiskAnalysis(this.patientId).subscribe({
      next: (d: any) => { this.analysis = d; this.loading = false; this.cdr.detectChanges(); },
      error: (e) => {
        this.error = e.error?.message || e.error || 'Erreur d\'analyse';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRiskClass(l: string) {
    return { LOW: 'risk-low', MEDIUM: 'risk-med', HIGH: 'risk-high', CRITICAL: 'risk-crit' }[l] || '';
  }

  getRiskIcon(l: string) {
    return { LOW: '✅', MEDIUM: '⚠️', HIGH: '🔶', CRITICAL: '🚨' }[l] || '❓';
  }

  get riskColor(): string {
    const l = this.analysis?.currentRiskLevel;
    const colors: Record<string, string> = { LOW: '#34d399', MEDIUM: '#fbbf24', HIGH: '#fb923c', CRITICAL: '#f87171' };
    return colors[l] || '#94a3b8';
  }

  get scorePercent(): number {
    return Math.max(0, Math.min(100, this.analysis?.averageScore || 0));
  }
}
