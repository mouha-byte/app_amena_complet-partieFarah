import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Question {
  id?: number;
  question: string;
  correctAnswer: string;
  points: number;
  category: string;
  difficulty: string;
  createdAt?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:8085/api/game-results'; // Backend API URL

  constructor(private http: HttpClient) { }

  // Récupérer toutes les questions
  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(this.apiUrl);
  }

  // Créer une nouvelle question
  createQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(this.apiUrl, question);
  }

  // Mettre à jour une question
  updateQuestion(id: number, question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${id}`, question);
  }

  // Supprimer une question
  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Rechercher des questions par terme
  searchQuestions(term: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/search?q=${encodeURIComponent(term)}`);
  }
}
