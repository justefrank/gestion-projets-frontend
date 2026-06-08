import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from '../models';

@Injectable({ providedIn: 'root' })
export class ProjetService {

  private apiUrl = 'http://127.0.0.1:8000/api/projets';

  constructor(private http: HttpClient) {}

  // GET /api/projets/ — liste avec filtres optionnels
  getAll(filtres?: any): Observable<Projet[]> {
    let params = new HttpParams();
    if (filtres?.statut) params = params.set('statut', filtres.statut);
    if (filtres?.search) params = params.set('search', filtres.search);
    return this.http.get<Projet[]>(`${this.apiUrl}/`, { params });
  }

  // GET /api/projets/{id}/
  getById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.apiUrl}/${id}/`);
  }

  // POST /api/projets/
  create(data: Partial<Projet>): Observable<Projet> {
    return this.http.post<Projet>(`${this.apiUrl}/`, data);
  }

  // PUT /api/projets/{id}/
  update(id: number, data: Partial<Projet>): Observable<Projet> {
    return this.http.put<Projet>(`${this.apiUrl}/${id}/`, data);
  }

  // DELETE /api/projets/{id}/
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  // GET /api/projets/{id}/dashboard/
  getDashboard(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/dashboard/`);
  }

  // POST /api/projets/{id}/ajouter_membre/
  ajouterMembre(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/ajouter_membre/`, data);
  }
}
