import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Incident, IncidentComment, IncidentType, PatientStats } from '../models/incident.model';

@Injectable({
    providedIn: 'root'
})
export class IncidentService {

    // Toutes les requêtes passent par l'API Gateway (port 8085) via le proxy Angular
    private apiUrl = '/api';

    private _refresh$ = new Subject<void>();

    constructor(private http: HttpClient) { }

    get refresh$() {
        return this._refresh$;
    }

    // --- INCIDENTS ---

    getAllActiveIncidents(): Observable<Incident[]> {
        return this.http.get<Incident[]>(`${this.apiUrl}/incidents`);
    }

    // Admin History (All incidents active + deleted)
    getIncidentHistory(): Observable<Incident[]> {
        return this.http.get<Incident[]>(`${this.apiUrl}/incidents/history`);
    }

    // Patient History (All incidents active + deleted for a patient)
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
        return this.http.post<Incident>(`${this.apiUrl}/incidents`, incident)
            .pipe(tap(() => this._refresh$.next()));
    }

    updateIncident(id: number, incident: Incident): Observable<Incident> {
        return this.http.put<Incident>(`${this.apiUrl}/incidents/${id}`, incident)
            .pipe(tap(() => this._refresh$.next()));
    }

    updateIncidentStatus(id: number, status: string): Observable<Incident> {
        return this.http.patch<Incident>(`${this.apiUrl}/incidents/${id}/status`, { status })
            .pipe(tap(() => this._refresh$.next()));
    }

    deleteIncident(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/incidents/${id}`)
            .pipe(tap(() => this._refresh$.next()));
    }

    // Get reported incidents (CAREGIVER)
    getReportedIncidents(): Observable<Incident[]> {
        return this.http.get<Incident[]>(`${this.apiUrl}/incidents/reported`);
    }

    // --- INCIDENT TYPES ---

    getAllIncidentTypes(): Observable<IncidentType[]> {
        return this.http.get<IncidentType[]>(`${this.apiUrl}/incident-types`);
    }

    createIncidentType(type: IncidentType): Observable<IncidentType> {
        return this.http.post<IncidentType>(`${this.apiUrl}/incident-types`, type)
            .pipe(tap(() => this._refresh$.next()));
    }

    updateIncidentType(id: number, type: IncidentType): Observable<IncidentType> {
        return this.http.put<IncidentType>(`${this.apiUrl}/incident-types/${id}`, type)
            .pipe(tap(() => this._refresh$.next()));
    }

    deleteIncidentType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/incident-types/${id}`)
            .pipe(tap(() => this._refresh$.next()));
    }

    // --- COMMENTS ---

    getCommentsByIncident(incidentId: number): Observable<IncidentComment[]> {
        return this.http.get<IncidentComment[]>(`${this.apiUrl}/incidents/${incidentId}/comments`);
    }

    addComment(incidentId: number, comment: { content: string; authorId?: number; authorName?: string }): Observable<IncidentComment> {
        return this.http.post<IncidentComment>(`${this.apiUrl}/incidents/${incidentId}/comments`, comment);
    }

    deleteComment(commentId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/incidents/comments/${commentId}`);
    }

    // --- PATIENT STATS ---

    getPatientStats(): Observable<PatientStats[]> {
        return this.http.get<PatientStats[]>(`${this.apiUrl}/incidents/patient-stats`);
    }

    getPatientStatsById(patientId: number): Observable<PatientStats> {
        return this.http.get<PatientStats>(`${this.apiUrl}/incidents/patient-stats/${patientId}`);
    }

    sendPatientStatsByEmail(patientId: number, email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/incidents/patient-stats/${patientId}/send-email`, { email });
    }
}
