import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface LocalizationUser {
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

export interface OSMPlace {
  display_name: string;
  lat: string;
  lon: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {
  // URL dediee au service localisation
  private readonly localizationApi = 'http://localhost:8087/safezones';
  private readonly usersApi = 'http://localhost:8086/users';
  private readonly nominatimApi = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  getPatients(): Observable<LocalizationUser[]> {
    return this.http.get<LocalizationUser[]>(this.usersApi).pipe(
      map((users) => (users || []).filter((u) => u.role === 'PATIENT'))
    );
  }

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

  searchPlace(query: string): Observable<OSMPlace[]> {
    const params = new HttpParams()
      .set('format', 'jsonv2')
      .set('limit', '6')
      .set('q', query);

    const headers = new HttpHeaders({
      'Accept-Language': 'fr'
    });

    return this.http.get<OSMPlace[]>(this.nominatimApi, { params, headers });
  }
}
