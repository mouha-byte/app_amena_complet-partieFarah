import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { GameResultService } from '../../services/game-result.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-off-quiz-player',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-player.component.html',
  styleUrls: ['./quiz-player.component.css']
})
export class QuizPlayerComponent implements OnInit, OnDestroy {
  type = '';
  activityId = 0;
  activity: any = null;
  loading = true;
  error = '';

  // Quiz state
  currentQ = 0;
  answers: number[] = [];
  questionTimes: number[] = [];
  startTime = 0;
  totalStartTime = 0;
  timer = 0;
  timerInterval: any;
  finished = false;
  result: any = null;
  saving = false;
  saved = false;

  user: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizSvc: QuizService,
    private grSvc: GameResultService,
    private auth: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.user = this.auth.currentUser;
    this.type = this.route.snapshot.paramMap.get('type') || 'quiz';
    this.activityId = +(this.route.snapshot.paramMap.get('id') || 0);
    this.loadActivity();
  }

  ngOnDestroy() { clearInterval(this.timerInterval); }

  loadActivity() {
    this.loading = true;
    if (this.type === 'quiz') {
      this.quizSvc.getQuizById(this.activityId).subscribe({
        next: (d: any) => {
          // Transform backend questions to playable format
          this.activity = {
            ...d,
            questions: (d.questions || []).map((q: any) => {
              const opts = [q.optionA || '', q.optionB || '', q.optionC || '', q.optionD || ''].filter((o: string) => o);
              const ansMap: any = { A: 0, B: 1, C: 2, D: 3 };
              const ca = ansMap[(q.correctAnswer || 'A').toUpperCase()] ?? 0;
              return { questionText: q.text || '', options: opts, correctAnswer: ca };
            })
          };
          if (!this.activity.questions.length) {
            this.error = 'Ce quiz n\'a pas de questions';
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }
          this.initQuiz();
        },
        error: () => { this.error = 'Quiz introuvable'; this.loading = false; this.cdr.detectChanges(); }
      });
    } else {
      this.http.get(`http://localhost:8085/api/photo-activities/${this.activityId}`).subscribe({
        next: (d: any) => {
          // Convert photo to quiz-like format
          this.activity = {
            ...d,
            questions: [{
              questionText: d.description || 'Que voyez-vous sur cette image ?',
              options: d.options || ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: d.options?.indexOf(d.correctAnswer) ?? 0,
              imageUrl: d.imageUrl
            }]
          };
          this.initQuiz();
        },
        error: () => { this.error = 'Activité introuvable'; this.loading = false; this.cdr.detectChanges(); }
      });
    }
  }

  initQuiz() {
    this.loading = false;
    this.answers = new Array(this.activity.questions.length).fill(-1);
    this.questionTimes = new Array(this.activity.questions.length).fill(0);
    this.totalStartTime = Date.now();
    this.startQuestionTimer();
    this.cdr.detectChanges();
  }

  startQuestionTimer() {
    this.startTime = Date.now();
    this.timer = 0;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => { this.timer = Math.floor((Date.now() - this.startTime) / 1000); }, 100);
  }

  selectAnswer(optIndex: number) {
    if (this.finished) return;
    this.answers[this.currentQ] = optIndex;
    this.questionTimes[this.currentQ] = (Date.now() - this.startTime) / 1000;
  }

  next() {
    if (this.currentQ < this.activity.questions.length - 1) {
      this.currentQ++;
      this.startQuestionTimer();
    }
  }

  prev() {
    if (this.currentQ > 0) {
      this.currentQ--;
      this.startQuestionTimer();
    }
  }

  finish() {
    clearInterval(this.timerInterval);
    this.questionTimes[this.currentQ] = (Date.now() - this.startTime) / 1000;
    this.finished = true;

    const questions = this.activity.questions;
    let correct = 0;
    questions.forEach((q: any, i: number) => {
      if (this.answers[i] === q.correctAnswer) correct++;
    });

    const totalTime = Math.round((Date.now() - this.totalStartTime) / 1000);
    const avgTime = this.questionTimes.length ? this.questionTimes.reduce((a, b) => a + b, 0) / this.questionTimes.length : 0;

    this.result = {
      patientId: this.user?.id || 1,
      patientEmail: this.user?.email || '',
      patientName: (this.user?.firstname || '') + ' ' + (this.user?.lastname || ''),
      activityType: this.type === 'quiz' ? 'QUIZ' : 'PHOTO',
      activityId: this.activityId,
      activityTitle: this.activity.title,
      score: correct,
      maxScore: questions.length,
      difficulty: this.activity.difficulty || 'MEDIUM',
      totalQuestions: questions.length,
      correctAnswers: correct,
      timeSpentSeconds: totalTime,
      avgResponseTime: Math.round(avgTime * 10) / 10
    };
  }

  saveResult() {
    this.saving = true;
    this.grSvc.createGameResult(this.result).subscribe({
      next: (r: any) => {
        this.result = { ...this.result, ...r };
        this.saved = true;
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: () => { this.saving = false; this.cdr.detectChanges(); }
    });
  }

  get progress(): number {
    return Math.round(((this.currentQ + 1) / this.activity.questions.length) * 100);
  }

  get scorePercent(): number {
    if (!this.result) return 0;
    return Math.round((this.result.correctAnswers / this.result.totalQuestions) * 100);
  }

  getRiskClass(l: string) {
    return { LOW: 'risk-low', MEDIUM: 'risk-med', HIGH: 'risk-high', CRITICAL: 'risk-crit' }[l] || '';
  }
}
