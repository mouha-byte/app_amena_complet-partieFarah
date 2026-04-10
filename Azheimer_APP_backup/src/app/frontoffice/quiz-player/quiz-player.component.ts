import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService, Quiz, Question } from '../../services/quiz.service';
import { GameResultService, GameResult } from '../../services/game-result.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-quiz-player',
  templateUrl: './quiz-player.component.html',
  styleUrls: ['./quiz-player.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class QuizPlayerComponent implements OnInit, OnDestroy {
  
  quiz: Quiz | null = null;
  currentQuestionIndex = 0;
  selectedAnswer: string = '';
  score = 0;
  isQuizCompleted = false;
  userAnswers: { questionId: number, answer: string, isCorrect: boolean, timeMs: number }[] = [];
  isLoading = true;
  maxScore = 0;

  // Time tracking
  quizStartTime: number = 0;
  questionStartTime: number = 0;
  totalTimeSpent = 0;       // seconds
  timerInterval: any;
  elapsedDisplay = '00:00'; // live timer display

  // Result from backend (includes risk analysis)
  savedResult: GameResult | null = null;
  isSavingResult = false;
  saveError: string | null = null;

  constructor(
    private quizService: QuizService,
    private gameResultService: GameResultService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (quizId) {
      this.loadQuiz(parseInt(quizId));
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer(): void {
    this.quizStartTime = Date.now();
    this.questionStartTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.quizStartTime) / 1000);
      const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const secs = (elapsed % 60).toString().padStart(2, '0');
      this.elapsedDisplay = `${mins}:${secs}`;
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  loadQuiz(id: number): void {
    this.quizService.getQuizById(id).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.calculateMaxScore();
        this.isLoading = false;
        this.startTimer();
      },
      error: (error) => {
        console.error('Erreur lors du chargement du quiz:', error);
        this.isLoading = false;
      }
    });
  }

  calculateMaxScore(): void {
    if (!this.quiz || !this.quiz.questions) {
      this.maxScore = 0;
      return;
    }
    this.maxScore = this.quiz.questions.reduce((sum, q) => sum + (q.score || 0), 0);
  }

  get correctAnswersCount(): number {
    return this.userAnswers.filter(a => a.isCorrect).length;
  }

  get incorrectAnswersCount(): number {
    return this.userAnswers.filter(a => !a.isCorrect).length;
  }

  get successRate(): number {
    if (this.userAnswers.length === 0) return 0;
    return Math.round((this.correctAnswersCount / this.userAnswers.length) * 100);
  }

  get currentQuestion(): Question | null {
    if (!this.quiz || !this.quiz.questions) return null;
    return this.quiz.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    if (!this.quiz || !this.quiz.questions) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100);
  }

  selectAnswer(answer: string): void {
    this.selectedAnswer = answer;
  }

  submitAnswer(): void {
    if (!this.selectedAnswer || !this.currentQuestion) return;

    const isCorrect = this.selectedAnswer === this.currentQuestion.correctAnswer;
    const questionTime = Date.now() - this.questionStartTime;
    
    if (isCorrect) {
      this.score += this.currentQuestion.score;
    }

    this.userAnswers.push({
      questionId: this.currentQuestionIndex,
      answer: this.selectedAnswer,
      isCorrect,
      timeMs: questionTime
    });

    // Reset question timer for next question
    this.questionStartTime = Date.now();

    this.nextQuestion();
  }

  nextQuestion(): void {
    if (!this.quiz || !this.quiz.questions) return;

    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = '';
    } else {
      this.completeQuiz();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      // Restaurer la réponse précédente si elle existe
      const previousAnswer = this.userAnswers.find(a => a.questionId === this.currentQuestionIndex);
      if (previousAnswer) {
        this.selectedAnswer = previousAnswer.answer;
      }
    }
  }

  completeQuiz(): void {
    this.isQuizCompleted = true;
    this.stopTimer();
    this.totalTimeSpent = Math.floor((Date.now() - this.quizStartTime) / 1000);
    
    // Build the GameResult to send to backend
    const gameResult: GameResult = {
      patientId: 1,                        // TODO: get from logged-in user
      patientEmail: 'patient@example.com', // TODO: get from logged-in user
      patientName: 'Patient Test',         // TODO: get from logged-in user
      activityType: 'QUIZ',
      activityId: this.quiz?.id || 0,
      activityTitle: this.quiz?.title || 'Quiz',
      score: this.score,
      maxScore: this.maxScore,
      difficulty: (this.quiz?.level || this.quiz?.difficulty || 'MEDIUM').toUpperCase(),
      totalQuestions: this.quiz?.questions?.length || 0,
      correctAnswers: this.correctAnswersCount,
      timeSpentSeconds: this.totalTimeSpent
    };

    this.isSavingResult = true;
    this.saveError = null;

    this.gameResultService.createGameResult(gameResult).subscribe({
      next: (saved) => {
        this.savedResult = saved;
        this.isSavingResult = false;
        console.log('Résultat sauvegardé avec analyse de risque:', saved);
      },
      error: (err) => {
        this.isSavingResult = false;
        this.saveError = 'Impossible de sauvegarder le résultat. Vérifiez que le backend est démarré.';
        console.error('Erreur lors de la sauvegarde du résultat:', err);
      }
    });
  }

  restartQuiz(): void {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = '';
    this.score = 0;
    this.isQuizCompleted = false;
    this.userAnswers = [];
    this.savedResult = null;
    this.saveError = null;
    this.elapsedDisplay = '00:00';
    this.startTimer();
  }

  goToQuizzes(): void {
    this.router.navigate(['/quiz']);
  }

  getAnswerClass(option: string): string {
    if (!this.isQuizCompleted || !this.currentQuestion) return '';
    
    const isCorrect = option === this.currentQuestion.correctAnswer;
    const userAnswer = this.userAnswers.find(a => a.questionId === this.currentQuestionIndex)?.answer;
    const isSelected = option === userAnswer;

    if (isCorrect) return 'btn-success';
    if (isSelected && !isCorrect) return 'btn-danger';
    return 'btn-outline-secondary';
  }

  getOptionText(option: string): string {
    if (!this.currentQuestion) return '';
    
    switch (option) {
      case 'A': return this.currentQuestion.optionA;
      case 'B': return this.currentQuestion.optionB;
      case 'C': return this.currentQuestion.optionC;
      default: return '';
    }
  }
}
