import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjetService } from '../../../core/services/projet.service';

@Component({
  selector: 'app-projet-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './projet-form.component.html',
  styleUrl: './projet-form.component.scss'
})
export class ProjetFormComponent implements OnInit {

  projetForm: FormGroup;
  loading    = false;
  saving     = false;
  isEditMode = false;
  projetId: number | null = null;
  errorMessage = '';
  dateError    = '';

  statuts = [
    {
      value      : 'EN_ATTENTE',
      label      : 'En attente',
      icon       : 'hourglass_empty',
      color      : '#f57c00',
      description: 'Le projet est planifié mais pas encore démarré'
    },
    {
      value      : 'EN_COURS',
      label      : 'En cours',
      icon       : 'play_circle',
      color      : '#1976d2',
      description: 'Le projet est actuellement en cours de réalisation'
    },
    {
      value      : 'TERMINE',
      label      : 'Terminé',
      icon       : 'check_circle',
      color      : '#388e3c',
      description: 'Le projet est terminé avec succès'
    },
    {
      value      : 'ANNULE',
      label      : 'Annulé',
      icon       : 'cancel',
      color      : '#c62828',
      description: 'Le projet a été annulé'
    },
  ];

  constructor(
    private fb: FormBuilder,
    private projetService: ProjetService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.projetForm = this.fb.group({
      nom        : ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(2000)],
      date_debut : [null, Validators.required],
      date_fin   : [null, Validators.required],
      statut     : ['EN_ATTENTE', Validators.required],
    });
  }

  ngOnInit(): void {
    this.projetId = this.route.snapshot.params['id']
                   ? +this.route.snapshot.params['id']
                   : null;

    if (this.projetId) {
      this.isEditMode = true;
      this.loadProjet();
    }

    // Surveille les dates pour validation
    this.projetForm.get('date_fin')?.valueChanges.subscribe(() => {
      this.validateDates();
    });
  }

  // ── Getters erreurs ───────────────────────────
  get nomError(): string {
    const ctrl = this.projetForm.get('nom');
    if (ctrl?.touched && ctrl?.hasError('required'))  return 'Le nom est requis';
    if (ctrl?.touched && ctrl?.hasError('minlength')) return 'Minimum 3 caractères';
    return '';
  }

  get dateDebutError(): string {
    const ctrl = this.projetForm.get('date_debut');
    if (ctrl?.touched && ctrl?.hasError('required')) return 'La date de début est requise';
    return '';
  }

  get dateFinError(): string {
    const ctrl = this.projetForm.get('date_fin');
    if (ctrl?.touched && ctrl?.hasError('required')) return 'La date de fin est requise';
    return '';
  }

  // ── Validation dates ──────────────────────────
  validateDates(): void {
    const debut = this.projetForm.get('date_debut')?.value;
    const fin   = this.projetForm.get('date_fin')?.value;

    if (debut && fin && new Date(fin) <= new Date(debut)) {
      this.dateError = 'La date de fin doit être après la date de début';
    } else {
      this.dateError = '';
    }
  }

  // ── Helpers ───────────────────────────────────
  getMinDate(): Date {
    return new Date();
  }

  getDuration(): number {
    const debut = this.projetForm.get('date_debut')?.value;
    const fin   = this.projetForm.get('date_fin')?.value;
    if (!debut || !fin) return 0;
    const diff = new Date(fin).getTime() - new Date(debut).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // ── Chargement ────────────────────────────────
  loadProjet(): void {
    this.loading = true;
    this.projetService.getById(this.projetId!).subscribe({
      next: projet => {
        this.projetForm.patchValue({
          nom        : projet.nom,
          description: projet.description,
          date_debut : new Date(projet.date_debut),
          date_fin   : new Date(projet.date_fin),
          statut     : projet.statut,
        });
        this.loading = false;
      },
      error: err => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  // ── Soumission ────────────────────────────────
  onSubmit(): void {
    if (this.projetForm.invalid || this.dateError) return;

    this.saving = true;
    this.errorMessage = '';

    const formValue = this.projetForm.value;
    const data = {
      ...formValue,
      date_debut: this.formatDate(formValue.date_debut),
      date_fin  : this.formatDate(formValue.date_fin),
    };

    if (this.isEditMode) {
      this.projetService.update(this.projetId!, data).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/projets']);
        },
        error: err => {
          this.saving = false;
          this.errorMessage = err.error
            ? JSON.stringify(err.error)
            : 'Erreur lors de la modification.';
        }
      });
    } else {
      this.projetService.create(data).subscribe({
        next: projet => {
          this.saving = false;
          this.router.navigate(['/projets', projet.id]);
        },
        error: err => {
          this.saving = false;
          this.errorMessage = err.error
            ? JSON.stringify(err.error)
            : 'Erreur lors de la création.';
        }
      });
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d     = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day   = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  annuler(): void {
    this.router.navigate(['/projets']);
  }
}
