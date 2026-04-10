import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

export interface AppUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'CAREGIVER' | string;
}

export interface SafeZone {
  id?: number;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  patientId: number;
}

export interface LocationPing {
  id?: number;
  patientId: number;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  speedKmh?: number;
  source?: string;
  recordedAt?: string;
}

export interface MovementAlert {
  id: number;
  patientId: number;
  alertType: 'OUT_OF_SAFE_ZONE' | 'IMMOBILE_TOO_LONG' | 'RAPID_OR_UNUSUAL_MOVEMENT' | 'GPS_NO_DATA' | string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | string;
  message: string;
  acknowledged: boolean;
  emailSent: boolean;
  createdAt: string;
  acknowledgedAt?: string;
}

export interface OSMPlace {
  display_name: string;
  lat: string;
  lon: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private readonly movementApi = 'http://localhost:8082';
  private readonly localizationApi = 'http://localhost:8087/safezones';
  private readonly usersApi = 'http://localhost:8086/users';

  constructor(private http: HttpClient) {}

  // Users
  getPatients(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.usersApi).pipe(
      map((users) => (users || []).filter((u) => u.role === 'PATIENT'))
    );
  }

  resolvePatientWhatsAppPhone(patientUserId: number): Observable<string | null> {
    return this.getPatients().pipe(
      map((patients) => {
        const patient = (patients || []).find((p) => p.id === patientUserId);
        return this.normalizePhoneForWhatsapp(patient?.phone || '');
      }),
      catchError(() => of(null))
    );
  }

  // Safe zones CRUD
  getSafeZones(): Observable<SafeZone[]> {
    return this.http.get<SafeZone[]>(this.localizationApi);
  }

  getSafeZonesByPatient(patientId: number): Observable<SafeZone[]> {
    return this.http.get<SafeZone[]>(`${this.localizationApi}/patient/${patientId}`);
  }

  createSafeZone(zone: SafeZone): Observable<SafeZone> {
    return this.http.post<SafeZone>(this.localizationApi, zone);
  }

  updateSafeZone(id: number, zone: SafeZone): Observable<SafeZone> {
    return this.http.put<SafeZone>(`${this.localizationApi}/${id}`, zone);
  }

  deleteSafeZone(id: number): Observable<void> {
    return this.http.delete<void>(`${this.localizationApi}/${id}`);
  }

  // Location reporting and tracking
  reportLocation(payload: Partial<LocationPing>): Observable<LocationPing> {
    return this.http.post<LocationPing>(`${this.movementApi}/locations/report`, payload);
  }

  getLatestLocation(patientId: number): Observable<LocationPing> {
    return this.http.get<LocationPing>(`${this.movementApi}/locations/patient/${patientId}/latest`);
  }

  getLocationHistory(patientId: number, minutes = 180): Observable<LocationPing[]> {
    const params = new HttpParams().set('minutes', String(minutes));
    return this.http.get<LocationPing[]>(`${this.movementApi}/locations/patient/${patientId}/history`, { params });
  }

  // Alerts
  getAlerts(unacknowledgedOnly = false): Observable<MovementAlert[]> {
    const params = new HttpParams().set('unacknowledgedOnly', String(unacknowledgedOnly));
    return this.http.get<MovementAlert[]>(`${this.movementApi}/alerts`, { params });
  }

  getPatientAlerts(patientId: number): Observable<MovementAlert[]> {
    return this.http.get<MovementAlert[]>(`${this.movementApi}/alerts/patient/${patientId}`);
  }

  acknowledgeAlert(alertId: number): Observable<MovementAlert> {
    return this.http.put<MovementAlert>(`${this.movementApi}/alerts/${alertId}/ack`, {});
  }

  // OpenStreetMap geocoding
  searchPlace(query: string): Observable<OSMPlace[]> {
    const params = new HttpParams()
      .set('format', 'jsonv2')
      .set('limit', '6')
      .set('q', query);

    const headers = new HttpHeaders({
      'Accept-Language': 'fr'
    });

    return this.http.get<OSMPlace[]>('https://nominatim.openstreetmap.org/search', { params, headers });
  }

  private normalizePhoneForWhatsapp(value: string): string | null {
    const raw = (value || '').trim();
    if (!raw || raw.includes('@')) {
      return null;
    }

    let normalized = raw.replace(/[^\d+]/g, '');
    if (!normalized) {
      return null;
    }

    if (normalized.startsWith('+')) {
      normalized = normalized.slice(1);
    }
    if (normalized.startsWith('00')) {
      normalized = normalized.slice(2);
    }

    const digits = normalized.replace(/\D/g, '');
    if (digits.length === 8) {
      return `216${digits}`;
    }

    if (digits.length === 9 && digits.startsWith('0')) {
      return `216${digits.slice(1)}`;
    }

    return digits.length >= 10 ? digits : null;
  }
}
