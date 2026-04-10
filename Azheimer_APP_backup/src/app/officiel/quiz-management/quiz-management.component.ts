import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-off-quiz-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './quiz-management.component.html',
  styleUrls: ['./quiz-management.component.css']
})
export class QuizManagementComponent implements OnInit {
  quizzes: any[] = [];
  loading = true;
  showForm = false;
  editing = false;
  msg = '';
  msgType = '';

  form: any = this.emptyForm();

  constructor(private quizSvc: QuizService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  emptyForm() {
    return {
      id: null, title: '', description: '', difficulty: 'EASY', theme: 'MEMORY', type: 'QUIZ',
      questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]
    };
  }

  /** Transform backend question → UI form question */
  private backendToForm(q: any): any {
    const opts = [q.optionA || '', q.optionB || '', q.optionC || '', q.optionD || ''];
    const answerMap: any = { A: 0, B: 1, C: 2, D: 3 };
    const ca = answerMap[(q.correctAnswer || 'A').toUpperCase()] ?? 0;
    return { questionText: q.text || '', options: opts, correctAnswer: ca, score: q.score || 10 };
  }

  /** Transform UI form question → backend question */
  private formToBackend(q: any): any {
    const letters = ['A', 'B', 'C', 'D'];
    return {
      text: q.questionText || '',
      optionA: q.options?.[0] || '',
      optionB: q.options?.[1] || '',
      optionC: q.options?.[2] || '',
      optionD: q.options?.[3] || '',
      correctAnswer: letters[q.correctAnswer] || 'A',
      score: q.score || 10
    };
  }

  load() {
    this.loading = true;
    this.quizSvc.getQuizzes().subscribe({
      next: (d: any) => { this.quizzes = d || []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.showMsg('Erreur de chargement', 'error'); this.cdr.detectChanges(); }
    });
  }

  openCreate() {
    this.form = this.emptyForm();
    this.editing = false;
    this.showForm = true;
  }

  openEdit(q: any) {
    const clone = JSON.parse(JSON.stringify(q));
    this.form = {
      id: clone.id,
      title: clone.title || '',
      description: clone.description || '',
      difficulty: clone.difficulty || 'EASY',
      theme: clone.theme || 'MEMORY',
      type: clone.type || 'QUIZ',
      questions: (clone.questions || []).map((qq: any) => this.backendToForm(qq))
    };
    if (!this.form.questions.length) {
      this.form.questions = [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }];
    }
    this.editing = true;
    this.showForm = true;
  }

  addQuestion() {
    this.form.questions.push({ questionText: '', options: ['', '', '', ''], correctAnswer: 0 });
  }

  removeQuestion(i: number) {
    if (this.form.questions.length > 1) this.form.questions.splice(i, 1);
  }

  save() {
    const payload: any = {
      title: this.form.title,
      description: this.form.description,
      difficulty: this.form.difficulty,
      level: this.form.difficulty,
      theme: this.form.theme || 'MEMORY',
      type: this.form.type || 'QUIZ',
      status: 'ACTIVE',
      questions: (this.form.questions || []).map((q: any) => this.formToBackend(q))
    };
    if (this.editing) {
      this.quizSvc.updateQuiz(this.form.id, payload).subscribe({
        next: () => { this.showMsg('Quiz mis à jour ✅', 'success'); this.showForm = false; this.load(); this.cdr.detectChanges(); },
        error: (e: any) => { this.showMsg('Erreur: ' + (e.error?.message || e.message), 'error'); this.cdr.detectChanges(); }
      });
    } else {
      this.quizSvc.createQuiz(payload).subscribe({
        next: () => { this.showMsg('Quiz créé ✅', 'success'); this.showForm = false; this.load(); this.cdr.detectChanges(); },
        error: (e: any) => { this.showMsg('Erreur: ' + (e.error?.message || e.message), 'error'); this.cdr.detectChanges(); }
      });
    }
  }

  delete(id: number) {
    if (!confirm('Supprimer ce quiz ?')) return;
    this.quizSvc.deleteQuiz(id).subscribe({
      next: () => { this.showMsg('Supprimé ✅', 'success'); this.load(); this.cdr.detectChanges(); },
      error: (e: any) => { this.showMsg('Erreur suppression', 'error'); this.cdr.detectChanges(); }
    });
  }

  showMsg(m: string, t: string) {
    this.msg = m; this.msgType = t;
    setTimeout(() => this.msg = '', 4000);
  }

  trackByIdx(i: number) { return i; }
}
