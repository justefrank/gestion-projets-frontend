import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">

        <mat-card-header>
          <mat-card-title>
            <mat-icon>business</mat-icon>
            Gestion de Projets
          </mat-card-title>
          <mat-card-subtitle>Connectez-vous à votre compte</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom d'utilisateur</mat-label>
              <input matInput formControlName="username" placeholder="username"/>
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                Le nom d'utilisateur est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput
                     [type]="hidePassword ? 'password' : 'text'"
                     formControlName="password"/>
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Le mot de passe est requis
              </mat-error>
            </mat-form-field>

            <!-- Message d'erreur global -->
            <div class="error-message" *ngIf="errorMessage">
              <mat-icon>error</mat-icon>
              {{ errorMessage }}
            </div>

            <button mat-raised-button color="primary"
                    type="submit"
                    class="full-width submit-btn"
                    [disabled]="loginForm.invalid || loading">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Se connecter</span>
            </button>

          </form>
        </mat-card-content>

        <mat-card-actions>
          <p>Pas encore de compte ?
            <a routerLink="/register">Créer un compte</a>
          </p>
        </mat-card-actions>

      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 24px;
      border-radius: 16px;
    }
    mat-card-header {
      margin-bottom: 24px;
      text-align: center;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      justify-content: center;
    }
    .full-width { width: 100%; }
    .submit-btn {
      margin-top: 16px;
      height: 48px;
      font-size: 16px;
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      margin-bottom: 16px;
      padding: 12px;
      background: #ffebee;
      border-radius: 8px;
    }
    mat-card-actions {
      text-align: center;
      padding-top: 16px;
    }
    a { color: #667eea; text-decoration: none; font-weight: 500; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Redirige si déjà connecté
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
      }
    });
  }
}
