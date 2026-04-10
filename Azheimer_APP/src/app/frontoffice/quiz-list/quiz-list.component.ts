import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService, Quiz } from '../../services/quiz.service';

// Déclarer Math pour le template
@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class QuizListComponent implements OnInit {
  protected Math = Math;

  quizzes: Quiz[] = [];
  isLoading = false;
  searchTerm = '';

  constructor(
    private quizService: QuizService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.isLoading = true;

    // Appeler l'API backend pour récupérer les quiz réels
    this.quizService.getQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.isLoading = false;
        console.log('Quiz chargés depuis le backend:', quizzes);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des quiz:', error);
        this.isLoading = false;
        this.quizzes = []; // Show empty list on error to avoid confusion with mock data
      }
    });
  }

  startQuiz(quizId: number): void {
    this.router.navigate(['/quiz/player', quizId]);
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

  getTotalScore(quiz: Quiz): number {
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      return 0;
    }
    return quiz.questions.reduce((sum, q) => sum + (q.score || 0), 0);
  }

  getEstimatedDuration(quiz: Quiz): number {
    const questionCount = quiz.questions?.length || 0;
    return Math.round(questionCount * 1.5);
  }
}

