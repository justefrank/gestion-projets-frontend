import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthTokens, User } from '../models';

@Injectable({
  providedIn: 'root'  // disponible dans toute l'application
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  // BehaviorSubject → stocke l'utilisateur connecté et notifie
  // tous les composants qui l'écoutent quand il change
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Au démarrage, charge l'utilisateur depuis le localStorage
    this.loadUserFromStorage();
  }

  // ── Login ────────────────────────────────────
  login(username: string, password: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.apiUrl}/token/`, { username, password })
      .pipe(
        tap(tokens => {
          // Sauvegarde les tokens dans localStorage
          localStorage.setItem('access_token', tokens.access);
          localStorage.setItem('refresh_token', tokens.refresh);
          // Charge le profil de l'utilisateur connecté
          this.loadCurrentUser();
        })
      );
  }

  // ── Register ─────────────────────────────────
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, data);
  }

  // ── Logout ───────────────────────────────────
  logout(): void {
    const refresh = localStorage.getItem('refresh_token');
    // Informe le backend pour blacklister le token
    this.http.post(`${this.apiUrl}/logout/`, { refresh }).subscribe();
    // Nettoie le localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Charge le profil utilisateur ─────────────
  loadCurrentUser(): void {
    this.http.get<User>(`${this.apiUrl}/users/me/`).subscribe({
      next: user => this.currentUserSubject.next(user),
      error: () => this.currentUserSubject.next(null)
    });
  }

  // ── Charge depuis localStorage ────────────────
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  // ── Vérifie si connecté ───────────────────────
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
}
