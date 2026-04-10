import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Quiz {
  id: number;
  title: string;
  theme: string;
  level: string;
  score: number;
  questions: number;
  createdAt: string;
  status: string;
}

export interface Photo {
  id: number;
  title: string;
  type: string;
  imageUrl: string;
  difficulty: string;
  points: number;
  createdAt: string;
  status: string;
}

export interface QuestionAnswer {
  id: number;
  question: string;
  correctAnswer: string;
  points: number;
  category: string;
  difficulty: string;
  createdAt: string;
  status: string;
}

export interface ActivityResponse {
  success: boolean;
  data?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameActivityService {
  private readonly API_BASE_URL = 'http://localhost:8085/api';

  constructor(private http: HttpClient) { }

  // Quiz endpoints
  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.API_BASE_URL}/quiz`);
  }

  getQuizById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.API_BASE_URL}/quiz/${id}`);
  }

  createQuiz(quiz: Partial<Quiz>): Observable<ActivityResponse> {
    return this.http.post<ActivityResponse>(`${this.API_BASE_URL}/quiz`, quiz);
  }

  updateQuiz(id: number, quiz: Partial<Quiz>): Observable<ActivityResponse> {
    return this.http.put<ActivityResponse>(`${this.API_BASE_URL}/quiz/${id}`, quiz);
  }

  deleteQuiz(id: number): Observable<ActivityResponse> {
    return this.http.delete<ActivityResponse>(`${this.API_BASE_URL}/quiz/${id}`);
  }

  // Photo endpoints
  getPhotos(): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.API_BASE_URL}/photo-activities`);
  }

  getPhotoById(id: number): Observable<Photo> {
    return this.http.get<Photo>(`${this.API_BASE_URL}/photo-activities/${id}`);
  }

  createPhoto(photo: Partial<Photo>): Observable<ActivityResponse> {
    return this.http.post<ActivityResponse>(`${this.API_BASE_URL}/photo-activities`, photo);
  }

  updatePhoto(id: number, photo: Partial<Photo>): Observable<ActivityResponse> {
    return this.http.put<ActivityResponse>(`${this.API_BASE_URL}/photo-activities/${id}`, photo);
  }

  deletePhoto(id: number): Observable<ActivityResponse> {
    return this.http.delete<ActivityResponse>(`${this.API_BASE_URL}/photo-activities/${id}`);
  }

  uploadPhoto(file: File, photoData: Partial<Photo>): Observable<ActivityResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', photoData.title || '');
    formData.append('type', photoData.type || '');
    formData.append('difficulty', photoData.difficulty || '');
    formData.append('points', photoData.points?.toString() || '0');

    return this.http.post<ActivityResponse>(`${this.API_BASE_URL}/photo-activities/upload`, formData);
  }

  // Q&A endpoints (questions are part of quiz, managed via quiz endpoints)
  getQuestions(): Observable<QuestionAnswer[]> {
    return this.http.get<QuestionAnswer[]>(`${this.API_BASE_URL}/game-results`);
  }

  getQuestionById(id: number): Observable<QuestionAnswer> {
    return this.http.get<QuestionAnswer>(`${this.API_BASE_URL}/game-results/${id}`);
  }

  createQuestion(question: Partial<QuestionAnswer>): Observable<ActivityResponse> {
    return this.http.post<ActivityResponse>(`${this.API_BASE_URL}/game-results`, question);
  }

  updateQuestion(id: number, question: Partial<QuestionAnswer>): Observable<ActivityResponse> {
    return this.http.put<ActivityResponse>(`${this.API_BASE_URL}/game-results/${id}`, question);
  }

  deleteQuestion(id: number): Observable<ActivityResponse> {
    return this.http.delete<ActivityResponse>(`${this.API_BASE_URL}/game-results/${id}`);
  }

  // Front-Office endpoints - pour récupérer les activités par catégorie
  getQuizzesForFrontOffice(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.API_BASE_URL}/quiz`);
  }

  getPhotosForFrontOffice(): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.API_BASE_URL}/photo-activities`);
  }

  getQuestionsForFrontOffice(): Observable<QuestionAnswer[]> {
    return this.http.get<QuestionAnswer[]>(`${this.API_BASE_URL}/game-results`);
  }

  // Méthodes utilitaires
  getActivitiesByCategory(category: string): Observable<any[]> {
    switch (category.toLowerCase()) {
      case 'quiz':
        return this.getQuizzesForFrontOffice();
      case 'photo':
        return this.getPhotosForFrontOffice();
      case 'qa':
        return this.getQuestionsForFrontOffice();
      default:
        return new Observable<any[]>(observer => {
          observer.error('Catégorie non reconnue');
          observer.complete();
        });
    }
  }

  searchActivities(searchTerm: string, category?: string): Observable<any[]> {
    let url = `${this.API_BASE_URL}/frontoffice/search?q=${encodeURIComponent(searchTerm)}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    return this.http.get<any[]>(url);
  }
}
