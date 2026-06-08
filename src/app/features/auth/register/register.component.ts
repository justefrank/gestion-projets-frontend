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
  selector: 'app-register',
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
    <div class="register-container">
      <mat-card class="register-card">

        <mat-card-header>
          <mat-card-title>
            <mat-icon>person_add</mat-icon>
            Créer un compte
          </mat-card-title>
          <mat-card-subtitle>Rejoignez la plateforme</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">

            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="first_name"/>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="last_name"/>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom d'utilisateur</mat-label>
              <input matInput formControlName="username"/>
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
                Requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email"/>
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Email invalide
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="password"/>
              <mat-icon matPrefix>lock</mat-icon>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Minimum 8 caractères
              </mat-error>
            </mat-form-field>

            <div class="error-message" *ngIf="errorMessage">
              <mat-icon>error</mat-icon>
              {{ errorMessage }}
            </div>

            <div class="success-message" *ngIf="successMessage">
              <mat-icon>check_circle</mat-icon>
              {{ successMessage }}
            </div>

            <button mat-raised-button color="primary"
                    type="submit"
                    class="full-width submit-btn"
                    [disabled]="registerForm.invalid || loading">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Créer mon compte</span>
            </button>

          </form>
        </mat-card-content>

        <mat-card-actions>
          <p>Déjà un compte ?
            <a routerLink="/login">Se connecter</a>
          </p>
        </mat-card-actions>

      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .register-card {
      width: 100%;
      max-width: 480px;
      padding: 24px;
      border-radius: 16px;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      justify-content: center;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .full-width { width: 100%; }
    .submit-btn { margin-top: 16px; height: 48px; font-size: 16px; }
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
    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
      margin-bottom: 16px;
      padding: 12px;
      background: #e8f5e9;
      border-radius: 8px;
    }
    mat-card-actions { text-align: center; padding-top: 16px; }
    a { color: #667eea; text-decoration: none; font-weight: 500; }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Compte créé ! Redirection vers le login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Erreur lors de la création du compte.';
      }
    });
  }
}
