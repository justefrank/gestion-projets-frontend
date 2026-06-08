import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  registerForm: FormGroup;
  loading        = false;
  hidePassword   = true;
  errorMessage   = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      first_name: [''],
      last_name : [''],
      username  : ['', Validators.required],
      email     : ['', [Validators.required, Validators.email]],
      password  : ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  // ── Getters erreurs ───────────────────────────
  get usernameError(): string {
    const ctrl = this.registerForm.get('username');
    if (ctrl?.touched && ctrl?.hasError('required')) return 'Le nom d\'utilisateur est requis';
    return '';
  }

  get emailError(): string {
    const ctrl = this.registerForm.get('email');
    if (ctrl?.touched && ctrl?.hasError('required')) return 'L\'email est requis';
    if (ctrl?.touched && ctrl?.hasError('email'))    return 'Email invalide';
    return '';
  }

  get passwordError(): string {
    const ctrl = this.registerForm.get('password');
    if (ctrl?.touched && ctrl?.hasError('required'))  return 'Le mot de passe est requis';
    if (ctrl?.touched && ctrl?.hasError('minlength')) return 'Minimum 8 caractères';
    return '';
  }

  // ── Force du mot de passe ─────────────────────
  getPasswordStrength(): number {
    const pwd = this.registerForm.get('password')?.value || '';
    let score = 0;
    if (pwd.length >= 8)          score++;
    if (/[A-Z]/.test(pwd))        score++;
    if (/[0-9]/.test(pwd))        score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }

  getPasswordStrengthLabel(): string {
    const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
    return labels[this.getPasswordStrength()] || '';
  }

  getPasswordStrengthClass(): string {
    const classes = ['', 'strength-weak', 'strength-medium', 'strength-good', 'strength-strong'];
    return classes[this.getPasswordStrength()] || '';
  }

  // ── Soumission ────────────────────────────────
  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.username
          ? 'Ce nom d\'utilisateur est déjà pris.'
          : 'Erreur lors de la création du compte.';
      }
    });
  }
}
