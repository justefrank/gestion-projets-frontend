import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tache } from '../models';

@Injectable({ providedIn: 'root' })
export class TacheService {

  private apiUrl = 'http://127.0.0.1:8000/api/taches';

  constructor(private http: HttpClient) {}

  getAll(filtres?: any): Observable<Tache[]> {
    let params = new HttpParams();
    if (filtres?.statut)  params = params.set('statut', filtres.statut);
    if (filtres?.priorite) params = params.set('priorite', filtres.priorite);
    if (filtres?.projet)  params = params.set('projet', filtres.projet);
    return this.http.get<Tache[]>(`${this.apiUrl}/`, { params });
  }

  getById(id: number): Observable<Tache> {
    return this.http.get<Tache>(`${this.apiUrl}/${id}/`);
  }

  create(data: Partial<Tache>): Observable<Tache> {
    return this.http.post<Tache>(`${this.apiUrl}/`, data);
  }

  update(id: number, data: Partial<Tache>): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  // GET /api/taches/mes_taches/
  getMesTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/mes_taches/`);
  }

  // GET /api/taches/en_retard/
  getEnRetard(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/en_retard/`);
  }
}
