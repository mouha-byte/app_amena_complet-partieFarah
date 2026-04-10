import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PhotoActivity {
  id?: number;
  title: string;
  description?: string;
  imageUrl: string;
  type: string;
  difficulty: string;
  points?: number;
  status?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private apiUrl = 'http://localhost:8085/api/photo-activities';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Récupérer toutes les photos
  getPhotos(): Observable<PhotoActivity[]> {
    return this.http.get<PhotoActivity[]>(this.apiUrl);
  }

  // Récupérer une photo par ID
  getPhotoById(id: number): Observable<PhotoActivity> {
    return this.http.get<PhotoActivity>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle photo
  createPhoto(photo: PhotoActivity): Observable<any> {
    return this.http.post(this.apiUrl, photo, { headers: this.getHeaders() });
  }

  // Mettre à jour une photo
  updatePhoto(id: number, photo: PhotoActivity): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, photo, { headers: this.getHeaders() });
  }

  // Supprimer une photo
  deletePhoto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Rechercher des photos par type
  getPhotosByType(type: string): Observable<PhotoActivity[]> {
    return this.http.get<PhotoActivity[]>(`${this.apiUrl}/type/${type}`);
  }

  // Rechercher des photos par difficulté
  getPhotosByDifficulty(difficulty: string): Observable<PhotoActivity[]> {
    return this.http.get<PhotoActivity[]>(`${this.apiUrl}/difficulty/${difficulty}`);
  }

  // Rechercher des photos par titre
  searchPhotos(title: string): Observable<PhotoActivity[]> {
    return this.http.get<PhotoActivity[]>(`${this.apiUrl}/search?title=${title}`);
  }

  // Upload d'image (si nécessaire pour les fichiers)
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload`, formData);
  }
}
