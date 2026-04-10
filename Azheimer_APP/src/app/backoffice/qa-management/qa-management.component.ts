import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuestionService, Question } from '../../services/question.service';

@Component({
  selector: 'app-qa-management',
  templateUrl: './qa-management.component.html',
  styleUrls: ['./qa-management.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class QaManagementComponent implements OnInit {

  questions: Question[] = [];
  isLoading = false;
  searchTerm = '';
  isEditing = false;
  currentQuestionId: number | null = null;
  questionForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private questionService: QuestionService
  ) {
    this.questionForm = this.createQuestionForm();
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  createQuestionForm(): FormGroup {
    return this.fb.group({
      question: ['', [Validators.required, Validators.minLength(5)]],
      correctAnswer: ['', [Validators.required, Validators.minLength(1)]],
      points: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      category: ['', Validators.required],
      difficulty: ['', Validators.required]
    });
  }

  loadQuestions(): void {
    this.isLoading = true;
    this.questionService.getQuestions().subscribe({
      next: (data) => {
        this.questions = data;
        this.isLoading = false;
        console.log('Questions chargées:', this.questions);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des questions:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.isLoading = true;
      this.questionService.searchQuestions(this.searchTerm).subscribe({
        next: (data) => {
          this.questions = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la recherche:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.loadQuestions();
    }
  }

  onEdit(question: Question): void {
    console.log('Éditer question:', question);
    this.isEditing = true;
    this.currentQuestionId = question.id || null;
    
    // Pré-remplir le formulaire
    this.questionForm.patchValue({
      question: question.question,
      correctAnswer: question.correctAnswer,
      points: question.points,
      category: question.category,
      difficulty: question.difficulty
    });

    // Ouvrir la modal
    this.openModal();
  }

  onDelete(question: Question): void {
    console.log('Suppression de la question:', question);
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la question "${question.question}" ?\n\nCette action est irréversible.`)) {
      if (question.id) {
        this.questionService.deleteQuestion(question.id).subscribe({
          next: () => {
            this.questions = this.questions.filter(q => q.id !== question.id);
            console.log('Question supprimée avec succès:', question.question);
            this.showSuccessMessage('Question supprimée avec succès');
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.showErrorMessage('Erreur lors de la suppression de la question');
          }
        });
      }
    }
  }

  onAddNew(): void {
    console.log('Ajouter nouvelle question');
    this.isEditing = false;
    this.currentQuestionId = null;
    this.resetForm();
    this.openModal();
  }

  onSaveQuestion(): void {
    console.log('=== DÉBUT SAUVEGARDE QUESTION ===');
    console.log('Formulaire valide:', !this.questionForm.invalid);
    console.log('Valeur formulaire:', this.questionForm.value);
    
    if (this.questionForm.invalid) {
      console.log('SAUVEGARDE BLOQUÉE - Formulaire invalide');
      this.showErrorMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const questionData: Question = {
      ...this.questionForm.value,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    console.log('Données de la question à sauvegarder:', questionData);

    try {
      if (this.isEditing && this.currentQuestionId) {
        // Mise à jour
        this.questionService.updateQuestion(this.currentQuestionId, questionData).subscribe({
          next: (updatedQuestion) => {
            const index = this.questions.findIndex(q => q.id === this.currentQuestionId);
            if (index !== -1) {
              this.questions[index] = updatedQuestion;
              console.log('Question mise à jour avec succès');
              this.showSuccessMessage('Question mise à jour avec succès');
            }
            this.closeModal();
            this.clearFormAfterSave();
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.showErrorMessage('Erreur lors de la mise à jour de la question');
          }
        });
      } else {
        // Création
        this.questionService.createQuestion(questionData).subscribe({
          next: (newQuestion) => {
            this.questions.unshift(newQuestion);
            console.log('Question créée avec succès:', newQuestion);
            this.showSuccessMessage('Question ajoutée avec succès');
            this.closeModal();
            this.clearFormAfterSave();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.showErrorMessage('Erreur lors de la création de la question');
          }
        });
      }
      console.log('=== FIN SAUVEGARDE QUESTION ===');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.showErrorMessage('Erreur lors de la sauvegarde de la question');
    }
  }

  resetForm(): void {
    this.questionForm.reset();
    this.isEditing = false;
    this.currentQuestionId = null;
  }

  clearFormAfterSave(): void {
    this.isEditing = false;
    this.currentQuestionId = null;
  }

  openModal(): void {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('questionModal'));
    modal.show();
  }

  closeModal(): void {
    const modalElement = document.getElementById('questionModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
    
    // Forcer la suppression du backdrop et des classes
    setTimeout(() => {
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 300);
  }

  showSuccessMessage(message: string): void {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 3000);
  }

  showErrorMessage(message: string): void {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 5000);
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'GEOGRAPHY': 'bg-primary',
      'MATHEMATICS': 'bg-success',
      'SCIENCE': 'bg-info',
      'HISTORY': 'bg-warning',
      'LITERATURE': 'bg-secondary',
      'ART': 'bg-danger'
    };
    return colors[category] || 'bg-secondary';
  }

  getDifficultyBadge(difficulty: string): string {
    const badges: { [key: string]: string } = {
      'EASY': 'success',
      'MEDIUM': 'warning',
      'HARD': 'danger',
      'EXPERT': 'dark'
    };
    return badges[difficulty] || 'secondary';
  }

  getPointsColor(points: number): string {
    if (points <= 5) return 'text-success';
    if (points <= 10) return 'text-primary';
    if (points <= 15) return 'text-warning';
    return 'text-danger';
  }
}
