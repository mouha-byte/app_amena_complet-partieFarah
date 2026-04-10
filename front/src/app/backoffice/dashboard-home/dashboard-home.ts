import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AnalyticsService, IncidentStats } from '../../core/services/analytics.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.html',
  standalone: false
})
export class DashboardHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('severityChart') severityChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;

  stats: IncidentStats | null = null;
  loading = true;
  chartsRendered = false;

  private charts: Chart[] = [];

  constructor(private analyticsService: AnalyticsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.analyticsService.getIncidentStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        // Force Angular to render the *ngIf canvas elements into the DOM first
        this.cdr.detectChanges();
        setTimeout(() => this.renderCharts(), 50);
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  renderCharts(): void {
    if (!this.stats || this.chartsRendered) return;
    this.charts.forEach(c => c.destroy());
    this.charts = [];
    this.chartsRendered = true;

    const severityCtx = this.severityChartRef?.nativeElement;
    if (severityCtx) {
      this.charts.push(new Chart(severityCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(this.stats.bySeverity),
          datasets: [{
            label: 'Incidents',
            data: Object.values(this.stats.bySeverity),
            backgroundColor: ['#198754', '#ffc107', '#fd7e14', '#dc3545'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      }));
    }

    const statusCtx = this.statusChartRef?.nativeElement;
    if (statusCtx) {
      this.charts.push(new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(this.stats.byStatus),
          datasets: [{
            data: Object.values(this.stats.byStatus),
            backgroundColor: ['#dc3545', '#0d6efd', '#198754'],
            borderWidth: 2
          }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
      }));
    }

    const trendCtx = this.trendChartRef?.nativeElement;
    if (trendCtx) {
      this.charts.push(new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: Object.keys(this.stats.byMonth),
          datasets: [{
            label: 'Incidents / Month',
            data: Object.values(this.stats.byMonth),
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13,110,253,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0d6efd',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      }));
    }
  }
}
