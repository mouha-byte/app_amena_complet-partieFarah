import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Incident, IncidentComment, IncidentType, PatientStats } from '../models/incident.model';

export type IncidentItem = Incident;

@Injectable({
  providedIn: 'root'
})
export class IncidentIntegrationService {
  private readonly apiUrl = 'http://localhost:8089/api';
  private readonly refreshSubject = new Subject<void>();

  constructor(private http: HttpClient) {}

  get refresh$(): Observable<void> {
    return this.refreshSubject.asObservable();
  }

  getAllActiveIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/incidents`);
  }

  getIncidentHistory(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/incidents/history`);
  }

  getPatientIncidentsHistory(patientId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/incidents/patient/${patientId}/history`);
  }

  getIncidentsByPatient(patientId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/incidents/patient/${patientId}`);
  }

  getIncidentsByCaregiver(caregiverId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/incidents/caregiver/${caregiverId}`);
  }

  getIncidentById(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.apiUrl}/incidents/${id}`);
  }

  createIncident(incident: Incident): Observable<Incident> {
    return this.http
      .post<Incident>(`${this.apiUrl}/incidents`, incident)
      .pipe(tap(() => this.refreshSubject.next()));
  }

  updateIncident(id: number, incident: Incident): Observable<Incident> {
    return this.http
      .put<Incident>(`${this.apiUrl}/incidents/${id}`, incident)
      .pipe(tap(() => this.refreshSubject.next()));
  }

  updateIncidentStatus(id: number, status: string): Observable<Incident> {
    return this.http
      .patch<Incident>(`${this.apiUrl}/incidents/${id}/status`, { status })
      .pipe(tap(() => this.refreshSubject.next()));
  }

  deleteIncident(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/incidents/${id}`)
      .pipe(tap(() => this.refreshSubject.next()));
  }

  getReportedIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/incidents/reported`);
  }

  getAllIncidentTypes(): Observable<IncidentType[]> {
    return this.http.get<IncidentType[]>(`${this.apiUrl}/incident-types`);
  }

  createIncidentType(type: IncidentType): Observable<IncidentType> {
    return this.http
      .post<IncidentType>(`${this.apiUrl}/incident-types`, type)
      .pipe(tap(() => this.refreshSubject.next()));
  }

  updateIncidentType(id: number, type: IncidentType): Observable<IncidentType> {
    return this.http
      .put<IncidentType>(`${this.apiUrl}/incident-types/${id}`, type)
      .pipe(tap(() => this.refreshSubject.next()));
  }

  deleteIncidentType(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/incident-types/${id}`)
      .pipe(tap(() => this.refreshSubject.next()));
  }

  getCommentsByIncident(incidentId: number): Observable<IncidentComment[]> {
    return this.http.get<IncidentComment[]>(`${this.apiUrl}/incidents/${incidentId}/comments`);
  }

  addComment(incidentId: number, comment: { content: string; authorId?: number; authorName?: string }): Observable<IncidentComment> {
    return this.http.post<IncidentComment>(`${this.apiUrl}/incidents/${incidentId}/comments`, comment);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/incidents/comments/${commentId}`);
  }

  getPatientStats(): Observable<PatientStats[]> {
    return this.http.get<PatientStats[]>(`${this.apiUrl}/incidents/patient-stats`);
  }

  getPatientStatsById(patientId: number): Observable<PatientStats> {
    return this.http.get<PatientStats>(`${this.apiUrl}/incidents/patient-stats/${patientId}`);
  }

  sendPatientStatsByEmail(patientId: number, email: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/incidents/patient-stats/${patientId}/send-email`, { email });
  }
}
