import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { QuizService, Quiz, Question } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz-management',
  templateUrl: './quiz-management.component.html',
  styleUrls: ['./quiz-management.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule]
})
export class QuizManagementComponent implements OnInit {

  quizzes: Quiz[] = [];
  isLoading = false;
  searchTerm = '';
  quizForm: FormGroup;
  isEditing = false;
  currentQuizId: number | null = null;

  constructor(
    private router: Router,
    private quizService: QuizService,
    private fb: FormBuilder
  ) {
    this.quizForm = this.createQuizForm();
  }

  ngOnInit(): void {
    this.loadQuizzes();
  }

  createQuizForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      theme: ['', Validators.required],
      level: ['', Validators.required],
      questions: this.fb.array([])
    });
  }

  get questionsArray(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  createQuestionForm(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      score: [1, [Validators.required, Validators.min(1)]],
      correctAnswer: ['', Validators.required],
      optionA: ['', Validators.required],
      optionB: ['', Validators.required],
      optionC: ['', Validators.required],
      isValidated: [false]
    });
  }

  toggleQuestionValidation(index: number): void {
    const question = this.questionsArray.at(index);
    if (question.invalid && !question.get('isValidated')?.value) {
      alert('Veuillez remplir tous les champs de la question avant de la valider.');
      return;
    }
    const currentValue = question.get('isValidated')?.value;
    question.get('isValidated')?.setValue(!currentValue);
  }

  get validatedQuestionsCount(): number {
    return this.questionsArray.controls.filter(q => q.get('isValidated')?.value).length;
  }

  get isGlobalFormValid(): boolean {
    const hasTitle = this.quizForm.get('title')?.valid;
    const allQuestionsValidated = this.questionsArray.length === 7 &&
      this.questionsArray.controls.every(q => q.get('isValidated')?.value);
    return !!(hasTitle && allQuestionsValidated);
  }

  addQuestion(): void {
    if (this.questionsArray.length < 7) {
      this.questionsArray.push(this.createQuestionForm());
    }
  }

  removeQuestion(index: number): void {
    if (this.questionsArray.length > 1) {
      this.questionsArray.removeAt(index);
    }
  }

  loadQuizzes(): void {
    this.isLoading = true;
    this.quizService.getQuizzes().subscribe({
      next: (data) => {
        this.quizzes = data;
        this.isLoading = false;
        console.log('Quiz chargés:', this.quizzes);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des quiz:', error);
        this.isLoading = false;
        // Fallback pour montrer au moins quelque chose si le backend est éteint
        this.quizzes = [];
      }
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.quizService.searchQuizzes(this.searchTerm).subscribe({
        next: (data) => {
          this.quizzes = data;
        },
        error: (error) => {
          console.error('Erreur lors de la recherche:', error);
        }
      });
    } else {
      this.loadQuizzes();
    }
  }

  onEdit(quiz: Quiz): void {
    this.isEditing = true;
    this.currentQuizId = quiz.id || null;

    // Pré-remplir le formulaire
    this.quizForm.patchValue({
      title: quiz.title,
      theme: quiz.theme,
      level: quiz.level
    });

    // Vider et ajouter les questions
    this.questionsArray.clear();
    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions.forEach(question => {
        this.questionsArray.push(this.fb.group({
          text: [question.text || '', Validators.required],
          score: [question.score || 1, [Validators.required, Validators.min(1)]],
          correctAnswer: [question.correctAnswer || '', Validators.required],
          optionA: [question.optionA || '', Validators.required],
          optionB: [question.optionB || '', Validators.required],
          optionC: [question.optionC || '', Validators.required],
          isValidated: [true]
        }));
      });
    } else {
      // Ajouter 7 questions vides par défaut
      for (let i = 0; i < 7; i++) {
        this.addQuestion();
      }
    }

    // Ouvrir la modal
    this.openModal();
  }

  onDelete(quiz: Quiz): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le quiz "${quiz.title}" ?`)) {
      this.quizService.deleteQuiz(quiz.id!).subscribe({
        next: () => {
          this.quizzes = this.quizzes.filter(q => q.id !== quiz.id);
          console.log('Quiz supprimé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  onAddNew(): void {
    this.isEditing = false;
    this.currentQuizId = null;
    this.quizForm.reset();
    this.questionsArray.clear();

    // Ajouter 7 questions vides par défaut
    for (let i = 0; i < 7; i++) {
      this.addQuestion();
    }
    console.log('7 questions ajoutées automatiquement');

    // Ouvrir la modal
    this.openModal();
  }

  onSaveQuiz(): void {
    if (!this.isGlobalFormValid) {
      console.log('Sauvegarde bloquée - formulaire ou questions non validés');
      return;
    }

    const quizData: Quiz = {
      title: this.quizForm.value.title,
      description: 'Quiz créé via le formulaire',
      type: 'QUIZ',
      theme: this.quizForm.value.theme,
      level: this.quizForm.value.level,
      difficulty: this.quizForm.value.level,
      questions: this.questionsArray.value,
      status: 'ACTIVE'
    };

    this.isLoading = true;

    if (this.isEditing && this.currentQuizId) {
      // Mise à jour réelle
      this.quizService.updateQuiz(this.currentQuizId, quizData).subscribe({
        next: (response) => {
          console.log('Quiz mis à jour avec succès', response);
          this.loadQuizzes();
          this.closeModal();
          this.resetForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.isLoading = false;
          alert('Erreur lors de la mise à jour du quiz.');
        }
      });
    } else {
      // Création réelle
      this.quizService.createQuiz(quizData).subscribe({
        next: (response) => {
          console.log('Quiz créé avec succès', response);
          this.loadQuizzes();
          this.closeModal();
          this.resetForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.isLoading = false;
          alert('Erreur lors de la création du quiz. Vérifiez que le backend est lancé sur le port 8085.');
        }
      });
    }
  }

  openModal(): void {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('quizModal'));
    modal.show();
  }

  closeModal(): void {
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('quizModal'));
    if (modal) {
      modal.hide();
    }
  }

  resetForm(): void {
    this.quizForm.reset();
    this.questionsArray.clear();
    this.isEditing = false;
    this.currentQuizId = null;
  }

  getTotalScore(quiz: Quiz): number {
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      return 0;
    }
    return quiz.questions.reduce((sum, q) => sum + (q.score || 0), 0);
  }

  getThemeColor(theme: string): string {
    const colors: { [key: string]: string } = {
      'MEMORY': 'bg-primary',
      'MATHEMATICS': 'bg-success',
      'LOGIC': 'bg-warning',
      'SCIENCE': 'bg-info',
      'GEOGRAPHY': 'bg-secondary',
      'HISTORY': 'bg-danger',
      'ATTENTION': 'bg-info',
      'LANGUAGE': 'bg-success',
      'VISUAL': 'bg-warning'
    };
    return colors[theme] || 'bg-secondary';
  }

  getLevelBadge(level: string | undefined): string {
    const badges: { [key: string]: string } = {
      'EASY': 'success',
      'MEDIUM': 'warning',
      'HARD': 'danger',
      'EXPERT': 'dark'
    };
    return badges[level || ''] || 'secondary';
  }
}
