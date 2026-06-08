import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dashboard } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private apiUrl = 'http://127.0.0.1:8000/api/dashboard';

  constructor(private http: HttpClient) {}

  // GET /api/dashboard/
  get(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.apiUrl}/`);
  }
}
