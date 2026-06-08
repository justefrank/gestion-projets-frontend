import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TacheService } from '../../../core/services/tache.service';
import { ProjetService } from '../../../core/services/projet.service';
import { Projet } from '../../../core/models';

@Component({
  selector: 'app-tache-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './tache-form.component.html',
  styleUrl: './tache-form.component.scss'
})
export class TacheFormComponent implements OnInit {

  tacheForm: FormGroup;
  loading    = false;
  saving     = false;
  isEditMode = false;
  tacheId: number | null = null;
  errorMessage = '';
  projets: Projet[] = [];

  statuts = [
    { value: 'A_FAIRE',     label: 'À faire',     icon: 'radio_button_unchecked', color: '#888'    },
    { value: 'EN_COURS',    label: 'En cours',    icon: 'play_circle',            color: '#1976d2' },
    { value: 'EN_REVISION', label: 'En révision', icon: 'rate_review',            color: '#f57c00' },
    { value: 'TERMINE',     label: 'Terminé',     icon: 'check_circle',           color: '#388e3c' },
  ];

  priorites = [
    { value: 'FAIBLE',  label: 'Faible',  icon: 'south', color: '#4caf50' },
    { value: 'NORMALE', label: 'Normale', icon: 'remove', color: '#2196f3' },
    { value: 'HAUTE',   label: 'Haute',   icon: 'north', color: '#ff9800' },
    { value: 'URGENTE', label: 'Urgente', icon: 'priority_high', color: '#f44336' },
  ];

  constructor(
    private fb: FormBuilder,
    private tacheService: TacheService,
    private projetService: ProjetService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tacheForm = this.fb.group({
      titre      : ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(1000)],
      projet     : ['', Validators.required],
      priorite   : ['NORMALE', Validators.required],
      statut     : ['A_FAIRE', Validators.required],
      date_limite: [null],
    });
  }

  ngOnInit(): void {
    this.loadProjets();

    this.tacheId = this.route.snapshot.params['id']
                   ? +this.route.snapshot.params['id']
                   : null;

    if (this.tacheId) {
      this.isEditMode = true;
      this.loadTache();
    }
  }

  // ── Getters pour les erreurs ──────────────────
  get titreError(): string {
    const ctrl = this.tacheForm.get('titre');
    if (ctrl?.touched && ctrl?.hasError('required'))   return 'Le titre est requis';
    if (ctrl?.touched && ctrl?.hasError('minlength'))  return 'Minimum 3 caractères';
    return '';
  }

  get projetError(): string {
    const ctrl = this.tacheForm.get('projet');
    if (ctrl?.touched && ctrl?.hasError('required')) return 'Le projet est requis';
    return '';
  }

  // ── Chargement ────────────────────────────────
  loadProjets(): void {
    this.projetService.getAll().subscribe({
      next: projets => this.projets = projets,
      error: err => console.error('Erreur projets:', err)
    });
  }

  loadTache(): void {
    this.loading = true;
    this.tacheService.getById(this.tacheId!).subscribe({
      next: tache => {
        this.tacheForm.patchValue({
          titre      : tache.titre,
          description: tache.description,
          projet     : tache.projet,
          priorite   : tache.priorite,
          statut     : tache.statut,
          date_limite: tache.date_limite
                       ? new Date(tache.date_limite)
                       : null,
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
    if (this.tacheForm.invalid) return;

    this.saving = true;
    this.errorMessage = '';

    const formValue = this.tacheForm.value;
    const data = {
      ...formValue,
      date_limite: formValue.date_limite
                   ? this.formatDate(formValue.date_limite)
                   : null,
    };

    if (this.isEditMode) {
      this.tacheService.update(this.tacheId!, data).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/taches']);
        },
        error: err => {
          this.saving = false;
          this.errorMessage = err.error
            ? JSON.stringify(err.error)
            : 'Erreur lors de la modification.';
        }
      });
    } else {
      this.tacheService.create(data).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/taches']);
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

  // ── Helpers ───────────────────────────────────
  formatDate(date: any): string {
    if (!date) return '';
    const d     = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day   = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  goToNewProject(): void {
    this.router.navigate(['/projets/nouveau']);
  }

  annuler(): void {
    this.router.navigate(['/taches']);
  }
}
