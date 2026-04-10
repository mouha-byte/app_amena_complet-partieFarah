import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameResultService, GameResult, RiskAnalysis } from '../../services/game-result.service';
import { QuizService, Quiz, Question } from '../../services/quiz.service';
import { PhotoService, PhotoActivity } from '../../services/photo.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-test-panel',
  templateUrl: './test-panel.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class TestPanelComponent implements OnInit {

  activeTab = 'quiz'; // quiz | photo | result | risk

  // ===== QUIZ CRUD =====
  quizzes: Quiz[] = [];
  quizLoading = false;
  quizError = '';
  quizEditMode = false;
  quizForm: Quiz = this.emptyQuiz();
  quizSearchTitle = '';

  // ===== PHOTO CRUD =====
  photos: PhotoActivity[] = [];
  photoLoading = false;
  photoError = '';
  photoEditMode = false;
  photoForm: PhotoActivity = this.emptyPhoto();
  photoSearchTitle = '';

  // ===== GAME RESULT CRUD =====
  results: GameResult[] = [];
  resultsLoading = false;
  resultsError = '';
  resultEditMode = false;
  resultForm: GameResult = this.emptyResult();

  // ===== RISK ANALYSIS =====
  riskAnalysis: RiskAnalysis | null = null;
  riskPatientId = 1;
  riskLoading = false;
  riskError = '';

  // ===== SIMULATE =====
  simForm = {
    patientId: 1, patientName: 'Patient Test', patientEmail: 'patient@example.com',
    activityId: 1, activityTitle: 'Quiz Test', difficulty: 'MEDIUM',
    totalQuestions: 10, correctAnswers: 7, timeSpentSeconds: 120
  };
  simLoading = false;
  simResult: GameResult | null = null;
  simError = '';

  // ===== LOGS =====
  logs: string[] = [];

  constructor(
    private gameResultService: GameResultService,
    private quizService: QuizService,
    private photoService: PhotoService
  ) {}

  ngOnInit(): void {
    this.log('🧪 Test Panel initialisé — Backend sur le port 8085');
  }

  // ===================== QUIZ =====================
  emptyQuiz(): Quiz {
    return { title: '', description: '', type: 'QUIZ', level: 'EASY', theme: 'MEMORY', difficulty: 'EASY', questions: [] };
  }

  loadQuizzes(): void {
    this.quizLoading = true; this.quizError = '';
    this.log('GET /api/quiz');
    this.quizService.getQuizzes().subscribe({
      next: d => { this.quizzes = d; this.quizLoading = false; this.log(`✅ ${d.length} quiz chargés`); },
      error: e => { this.quizError = e.message; this.quizLoading = false; this.log(`❌ ${e.message}`); }
    });
  }

  searchQuizzes(): void {
    if (!this.quizSearchTitle.trim()) { this.loadQuizzes(); return; }
    this.quizLoading = true; this.quizError = '';
    this.log(`GET /api/quiz/search?title=${this.quizSearchTitle}`);
    this.quizService.searchQuizzes(this.quizSearchTitle).subscribe({
      next: d => { this.quizzes = d; this.quizLoading = false; this.log(`✅ ${d.length} quiz trouvés`); },
      error: e => { this.quizError = e.message; this.quizLoading = false; this.log(`❌ ${e.message}`); }
    });
  }

  newQuiz(): void {
    this.quizForm = this.emptyQuiz();
    this.quizEditMode = false;
  }

  editQuiz(q: Quiz): void {
    this.quizForm = { ...q, questions: q.questions ? q.questions.map(qu => ({ ...qu })) : [] };
    this.quizEditMode = true;
  }

  saveQuiz(): void {
    const payload = { ...this.quizForm, difficulty: this.quizForm.level };
    if (this.quizEditMode && this.quizForm.id) {
      this.log(`PUT /api/quiz/${this.quizForm.id}`);
      this.quizService.updateQuiz(this.quizForm.id, payload).subscribe({
        next: () => { this.log('✅ Quiz mis à jour'); this.loadQuizzes(); this.newQuiz(); },
        error: e => this.log(`❌ ${e.message}`)
      });
    } else {
      this.log('POST /api/quiz');
      this.quizService.createQuiz(payload).subscribe({
        next: () => { this.log('✅ Quiz créé'); this.loadQuizzes(); this.newQuiz(); },
        error: e => this.log(`❌ ${e.message}`)
      });
    }
  }

  deleteQuiz(id: number): void {
    if (!confirm(`Supprimer le quiz #${id} ?`)) return;
    this.log(`DELETE /api/quiz/${id}`);
    this.quizService.deleteQuiz(id).subscribe({
      next: () => { this.log(`✅ Quiz ${id} supprimé`); this.loadQuizzes(); },
      error: e => this.log(`❌ ${e.message}`)
    });
  }

  deleteAllQuizzes(): void {
    if (!confirm(`Supprimer TOUS les ${this.quizzes.length} quiz ?`)) return;
    const ids = this.quizzes.map(q => q.id!).filter(id => id != null);
    ids.forEach(id => {
      this.quizService.deleteQuiz(id).subscribe({
        next: () => this.log(`✅ Quiz ${id} supprimé`),
        error: e => this.log(`❌ Quiz ${id}: ${e.message}`)
      });
    });
    setTimeout(() => this.loadQuizzes(), 1500);
  }

  // Question management inside quiz form
  addQuestion(): void {
    this.quizForm.questions = this.quizForm.questions || [];
    this.quizForm.questions.push({ text: '', optionA: '', optionB: '', optionC: '', correctAnswer: 'A', score: 10 });
  }

  removeQuestion(i: number): void {
    this.quizForm.questions?.splice(i, 1);
  }

  // ===================== PHOTO =====================
  emptyPhoto(): PhotoActivity {
    return { title: '', description: '', imageUrl: 'https://via.placeholder.com/300', type: 'IMAGE_RECOGNITION', difficulty: 'EASY' };
  }

  loadPhotos(): void {
    this.photoLoading = true; this.photoError = '';
    this.log('GET /api/photo-activities');
    this.photoService.getPhotos().subscribe({
      next: d => { this.photos = d; this.photoLoading = false; this.log(`✅ ${d.length} photos chargées`); },
      error: e => { this.photoError = e.message; this.photoLoading = false; this.log(`❌ ${e.message}`); }
    });
  }

  searchPhotos(): void {
    if (!this.photoSearchTitle.trim()) { this.loadPhotos(); return; }
    this.photoLoading = true; this.photoError = '';
    this.log(`GET /api/photo-activities/search?title=${this.photoSearchTitle}`);
    this.photoService.searchPhotos(this.photoSearchTitle).subscribe({
      next: d => { this.photos = d; this.photoLoading = false; this.log(`✅ ${d.length} photos trouvées`); },
      error: e => { this.photoError = e.message; this.photoLoading = false; this.log(`❌ ${e.message}`); }
    });
  }

  newPhoto(): void {
    this.photoForm = this.emptyPhoto();
    this.photoEditMode = false;
  }

  editPhoto(p: PhotoActivity): void {
    this.photoForm = { ...p };
    this.photoEditMode = true;
  }

  savePhoto(): void {
    if (this.photoEditMode && this.photoForm.id) {
      this.log(`PUT /api/photo-activities/${this.photoForm.id}`);
      this.photoService.updatePhoto(this.photoForm.id, this.photoForm).subscribe({
        next: () => { this.log('✅ Photo mise à jour'); this.loadPhotos(); this.newPhoto(); },
        error: e => this.log(`❌ ${e.message}`)
      });
    } else {
      this.log('POST /api/photo-activities');
      this.photoService.createPhoto(this.photoForm).subscribe({
        next: () => { this.log('✅ Photo créée'); this.loadPhotos(); this.newPhoto(); },
        error: e => this.log(`❌ ${e.message}`)
      });
    }
  }

  deletePhoto(id: number): void {
    if (!confirm(`Supprimer la photo #${id} ?`)) return;
    this.log(`DELETE /api/photo-activities/${id}`);
    this.photoService.deletePhoto(id).subscribe({
      next: () => { this.log(`✅ Photo ${id} supprimée`); this.loadPhotos(); },
      error: e => this.log(`❌ ${e.message}`)
    });
  }

  deleteAllPhotos(): void {
    if (!confirm(`Supprimer TOUTES les ${this.photos.length} photos ?`)) return;
    const ids = this.photos.map(p => p.id!).filter(id => id != null);
    ids.forEach(id => {
      this.photoService.deletePhoto(id).subscribe({
        next: () => this.log(`✅ Photo ${id} supprimée`),
        error: e => this.log(`❌ Photo ${id}: ${e.message}`)
      });
    });
    setTimeout(() => this.loadPhotos(), 1500);
  }

  // ===================== GAME RESULT =====================
  emptyResult(): GameResult {
    return {
      patientId: 1, patientEmail: 'test@example.com', patientName: 'Patient Test',
      activityType: 'QUIZ', activityId: 1, activityTitle: 'Quiz Test',
      score: 70, maxScore: 100, difficulty: 'MEDIUM',
      totalQuestions: 10, correctAnswers: 7, timeSpentSeconds: 120
    };
  }

  loadResults(): void {
    this.resultsLoading = true; this.resultsError = '';
    this.log('GET /api/game-results');
    this.gameResultService.getAllResults().subscribe({
      next: d => { this.results = d; this.resultsLoading = false; this.log(`✅ ${d.length} résultats chargés`); },
      error: e => { this.resultsError = e.message; this.resultsLoading = false; this.log(`❌ ${e.message}`); }
    });
  }

  newResult(): void {
    this.resultForm = this.emptyResult();
    this.resultEditMode = false;
  }

  editResult(r: GameResult): void {
    this.resultForm = { ...r };
    this.resultEditMode = true;
  }

  saveResult(): void {
    if (this.resultEditMode && this.resultForm.id) {
      this.log(`PUT /api/game-results/${this.resultForm.id}`);
      this.gameResultService.updateResult(this.resultForm.id, this.resultForm).subscribe({
        next: (saved) => { this.log(`✅ Résultat ${saved.id} mis à jour (risk=${saved.riskLevel})`); this.loadResults(); this.newResult(); },
        error: e => this.log(`❌ ${e.message}`)
      });
    } else {
      this.log('POST /api/game-results');
      this.gameResultService.createGameResult(this.resultForm).subscribe({
        next: (saved) => { this.log(`✅ Résultat créé: id=${saved.id}, weighted=${saved.weightedScore?.toFixed(1)}, risk=${saved.riskLevel}, alert=${saved.alertSent}`); this.loadResults(); this.newResult(); },
        error: e => this.log(`❌ ${e.message}`)
      });
    }
  }

  deleteResult(id: number): void {
    if (!confirm(`Supprimer le résultat #${id} ?`)) return;
    this.log(`DELETE /api/game-results/${id}`);
    this.gameResultService.deleteResult(id).subscribe({
      next: () => { this.log(`✅ Résultat ${id} supprimé`); this.loadResults(); },
      error: e => this.log(`❌ ${e.message}`)
    });
  }

  deleteAllResults(): void {
    if (!confirm(`Supprimer TOUS les ${this.results.length} résultats ?`)) return;
    const ids = this.results.map(r => r.id!).filter(id => id != null);
    ids.forEach(id => {
      this.gameResultService.deleteResult(id).subscribe({
        next: () => this.log(`✅ Résultat ${id} supprimé`),
        error: e => this.log(`❌ Résultat ${id}: ${e.message}`)
      });
    });
    setTimeout(() => this.loadResults(), 1500);
  }

  // ===================== SIMULATE SCENARIOS =====================
  simulateResult(): void {
    this.simLoading = true; this.simResult = null; this.simError = '';
    const maxScore = this.simForm.totalQuestions * 10;
    const score = this.simForm.correctAnswers * 10;
    const gameResult: GameResult = {
      patientId: this.simForm.patientId, patientName: this.simForm.patientName,
      patientEmail: this.simForm.patientEmail, activityType: 'QUIZ',
      activityId: this.simForm.activityId, activityTitle: this.simForm.activityTitle,
      score, maxScore, difficulty: this.simForm.difficulty,
      totalQuestions: this.simForm.totalQuestions, correctAnswers: this.simForm.correctAnswers,
      timeSpentSeconds: this.simForm.timeSpentSeconds
    };
    this.log(`POST /api/game-results → ${score}/${maxScore}, ${this.simForm.difficulty}, ${this.simForm.timeSpentSeconds}s`);
    this.gameResultService.createGameResult(gameResult).subscribe({
      next: s => { this.simResult = s; this.simLoading = false; this.log(`✅ weighted=${s.weightedScore?.toFixed(1)}, risk=${s.riskLevel}, alert=${s.alertSent}`); },
      error: e => { this.simError = e.message; this.simLoading = false; this.log(`❌ ${e.message}`); }
    });
  }

  simulateLowRisk(): void {
    this.simForm = { ...this.simForm, correctAnswers: 9, totalQuestions: 10, timeSpentSeconds: 60, difficulty: 'EASY' };
    this.simulateResult();
  }
  simulateMediumRisk(): void {
    this.simForm = { ...this.simForm, correctAnswers: 5, totalQuestions: 10, timeSpentSeconds: 180, difficulty: 'MEDIUM' };
    this.simulateResult();
  }
  simulateHighRisk(): void {
    this.simForm = { ...this.simForm, correctAnswers: 3, totalQuestions: 10, timeSpentSeconds: 300, difficulty: 'HARD' };
    this.simulateResult();
  }
  simulateCriticalRisk(): void {
    this.simForm = { ...this.simForm, correctAnswers: 1, totalQuestions: 10, timeSpentSeconds: 500, difficulty: 'HARD' };
    this.simulateResult();
  }

  // ===================== RISK ANALYSIS =====================
  loadRiskAnalysis(): void {
    this.riskLoading = true; this.riskError = ''; this.riskAnalysis = null;
    this.log(`GET /api/game-results/patient/${this.riskPatientId}/risk-analysis`);
    this.gameResultService.getRiskAnalysis(this.riskPatientId).subscribe({
      next: d => { this.riskAnalysis = d; this.riskLoading = false; this.log(`✅ tendance=${d.trend}, ${d.totalResults} résultats`); },
      error: e => { this.riskError = e.message; this.riskLoading = false; this.log(`❌ ${e.message}`); }
    });
  }

  // ===================== UTILS =====================
  log(msg: string): void {
    this.logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
    if (this.logs.length > 80) this.logs.pop();
  }
  clearLogs(): void { this.logs = []; }

  getRiskBadgeClass(level: string | undefined): string {
    switch (level) {
      case 'LOW': return 'bg-success';
      case 'MEDIUM': return 'bg-warning text-dark';
      case 'HIGH': return 'bg-danger';
      case 'CRITICAL': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
