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
  ],
  templateUrl: './tache-form.component.html',
  styleUrl: './tache-form.component.scss'
})
export class TacheFormComponent implements OnInit {

  tacheForm: FormGroup;
  loading = false;
  saving = false;
  isEditMode = false;
  tacheId: number | null = null;
  errorMessage = '';
  projets: Projet[] = [];

  statuts = [
    { value: 'A_FAIRE',     label: 'À faire'     },
    { value: 'EN_COURS',    label: 'En cours'    },
    { value: 'EN_REVISION', label: 'En révision' },
    { value: 'TERMINE',     label: 'Terminé'     },
  ];

  priorites = [
    { value: 'FAIBLE',  label: 'Faible'  },
    { value: 'NORMALE', label: 'Normale' },
    { value: 'HAUTE',   label: 'Haute'   },
    { value: 'URGENTE', label: 'Urgente' },
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
      description: [''],
      projet     : ['', Validators.required],
      priorite   : ['NORMALE', Validators.required],
      statut     : ['A_FAIRE', Validators.required],
      date_limite: [''],
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
          date_limite: tache.date_limite,
        });
        this.loading = false;
      },
      error: err => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

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

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day   = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  annuler(): void {
    this.router.navigate(['/taches']);
  }
}
