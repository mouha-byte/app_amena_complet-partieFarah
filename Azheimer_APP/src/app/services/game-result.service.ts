import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GameResult {
  id?: number;
  patientId: number;
  patientEmail?: string;
  patientName?: string;
  activityType: string;   // QUIZ, IMAGE_RECOGNITION, QUESTION_ANSWER
  activityId: number;
  activityTitle?: string;
  score: number;
  maxScore: number;
  weightedScore?: number;
  difficulty?: string;     // EASY, MEDIUM, HARD
  totalQuestions: number;
  correctAnswers: number;
  timeSpentSeconds: number;
  avgResponseTime?: number;
  riskLevel?: string;      // LOW, MEDIUM, HIGH, CRITICAL
  alertSent?: boolean;
  completedAt?: string;
}

export interface RiskAnalysis {
  patientId: number;
  trend: string;
  totalResults: number;
  results: GameResult[];
}

@Injectable({
  providedIn: 'root'
})
export class GameResultService {
  private readonly API_URL = 'http://localhost:8085/api/game-results';

  constructor(private http: HttpClient) {}

  /** Submit a game result (triggers score calculation + risk detection + email on backend) */
  createGameResult(result: GameResult): Observable<GameResult> {
    return this.http.post<GameResult>(this.API_URL, result);
  }

  /** Get all results */
  getAllResults(): Observable<GameResult[]> {
    return this.http.get<GameResult[]>(this.API_URL);
  }

  /** Get result by ID */
  getResultById(id: number): Observable<GameResult> {
    return this.http.get<GameResult>(`${this.API_URL}/${id}`);
  }

  /** Get results for a specific patient */
  getResultsByPatient(patientId: number): Observable<GameResult[]> {
    return this.http.get<GameResult[]>(`${this.API_URL}/patient/${patientId}`);
  }

  /** Get results for a specific activity */
  getResultsByActivity(activityType: string, activityId: number): Observable<GameResult[]> {
    return this.http.get<GameResult[]>(`${this.API_URL}/activity/${activityType}/${activityId}`);
  }

  /** Get patient statistics */
  getPatientStats(patientId: number, activityType: string): Observable<{ totalGames: number; averageScore: number }> {
    return this.http.get<{ totalGames: number; averageScore: number }>(
      `${this.API_URL}/patient/${patientId}/activity/${activityType}/stats`
    );
  }

  /** Get risk analysis for a patient */
  getRiskAnalysis(patientId: number): Observable<RiskAnalysis> {
    return this.http.get<RiskAnalysis>(`${this.API_URL}/patient/${patientId}/risk-analysis`);
  }

  /** Update an existing result */
  updateResult(id: number, result: GameResult): Observable<GameResult> {
    return this.http.put<GameResult>(`${this.API_URL}/${id}`, result);
  }

  /** Delete a result */
  deleteResult(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /** Manually send an alert email for a specific result */
  sendAlert(id: number): Observable<{ sent: boolean; message: string }> {
    return this.http.post<{ sent: boolean; message: string }>(`${this.API_URL}/${id}/send-alert`, {});
  }
}
