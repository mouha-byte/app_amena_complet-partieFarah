import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-off-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.css']
})
export class QuizListComponent implements OnInit {
  quizzes: any[] = [];
  photos: any[] = [];
  loading = true;
  activeTab: 'quiz' | 'photo' = 'quiz';

  constructor(private quizSvc: QuizService, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading = true;
    this.loaded = 0;
    this.quizSvc.getQuizzes().subscribe({
      next: (d: any) => { this.quizzes = d || []; this.checkDone(); },
      error: () => { this.quizzes = []; this.checkDone(); }
    });
    this.http.get<any[]>('http://localhost:8085/api/photo-activities').subscribe({
      next: (d) => { this.photos = d || []; this.checkDone(); },
      error: () => { this.photos = []; this.checkDone(); }
    });
  }

  private loaded = 0;
  checkDone() { if (++this.loaded >= 2) { this.loading = false; this.cdr.detectChanges(); } }

  getDiffIcon(d: string) {
    return { EASY: '🟢', MEDIUM: '🟡', HARD: '🔴' }[d] || '⚪';
  }

  getDiffLabel(d: string) {
    return { EASY: 'Facile', MEDIUM: 'Moyen', HARD: 'Difficile' }[d] || d;
  }
}
