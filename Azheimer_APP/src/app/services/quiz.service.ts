import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type ActivityType = 'QUIZ' | 'IMAGE_RECOGNITION' | 'QUESTION_ANSWER';
export type ActivityLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface Quiz {
  id?: number;
  title: string;
  description: string;
  type: ActivityType;
  level: ActivityLevel;
  theme: string; // Quiz theme (MEMORY, LOGIC, etc.)
  difficulty?: string; // Backend field (maps to level)
  category?: string;
  questions?: Question[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id?: number;
  text: string;
  score: number;
  correctAnswer: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:8085/api/quiz';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Récupérer tous les quiz
  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.apiUrl)
      .pipe(
        // make sure each quiz has a `level` field for the UI
        map(quizzes => quizzes.map(q => ({
          ...q,
          level: q.level ?? q.difficulty
        } as Quiz)))
      );
  }

  // Récupérer un quiz par ID
  getQuizById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`).pipe(
      map(q => ({
        ...q,
        level: q.level ?? q.difficulty
      } as Quiz))
    );
  }

  // Créer un nouveau quiz
  createQuiz(quiz: Quiz): Observable<any> {
    return this.http.post(this.apiUrl, quiz, { headers: this.getHeaders() });
  }

  // Mettre à jour un quiz
  updateQuiz(id: number, quiz: Quiz): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, quiz, { headers: this.getHeaders() });
  }

  // Supprimer un quiz
  deleteQuiz(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Rechercher des quiz par thématique
  getQuizzesByTheme(theme: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/theme/${theme}`);
  }

  // Rechercher des quiz par niveau
  getQuizzesByLevel(level: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/difficulty/${level}`);
  }

  // Rechercher des quiz par titre
  searchQuizzes(title: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/search?title=${title}`);
  }
}
