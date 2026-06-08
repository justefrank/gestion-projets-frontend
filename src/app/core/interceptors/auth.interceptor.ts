import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const http = inject(HttpClient);
  const token = authService.getAccessToken();

  // Ajoute le token à la requête
  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // Si token expiré (401) et qu'on a un refresh token
      if (error.status === 401 && authService.getRefreshToken()) {
        const refresh = authService.getRefreshToken();

        // Demande un nouveau access token
        return http.post<any>('http://127.0.0.1:8000/api/token/refresh/', { refresh })
          .pipe(
            switchMap(tokens => {
              // Sauvegarde le nouveau token
              localStorage.setItem('access_token', tokens.access);
              if (tokens.refresh) {
                localStorage.setItem('refresh_token', tokens.refresh);
              }

              // Relance la requête originale avec le nouveau token
              const retryReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${tokens.access}`)
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              // Si le refresh échoue aussi → déconnexion
              authService.logout();
              return throwError(() => refreshError);
            })
          );
      }

      return throwError(() => error);
    })
  );
};
