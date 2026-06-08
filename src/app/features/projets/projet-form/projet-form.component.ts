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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './projet-form.component.html',
  styleUrl: './projet-form.component.scss'
})
export class ProjetFormComponent implements OnInit {

  projetForm: FormGroup;
  loading = false;
  saving = false;
  isEditMode = false;
  projetId: number | null = null;
  errorMessage = '';

  statuts = [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'EN_COURS',   label: 'En cours'   },
    { value: 'TERMINE',    label: 'Terminé'    },
    { value: 'ANNULE',     label: 'Annulé'     },
  ];

  constructor(
    private fb: FormBuilder,
    private projetService: ProjetService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.projetForm = this.fb.group({
      nom        : ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      date_debut : ['', Validators.required],
      date_fin   : ['', Validators.required],
      statut     : ['EN_ATTENTE', Validators.required],
    });
  }

  ngOnInit(): void {
    // Vérifie si on est en mode édition (URL contient un id)
    this.projetId = this.route.snapshot.params['id']
                    ? +this.route.snapshot.params['id']
                    : null;

    if (this.projetId) {
      this.isEditMode = true;
      this.loadProjet();
    }
  }

  loadProjet(): void {
    this.loading = true;
    this.projetService.getById(this.projetId!).subscribe({
      next: projet => {
        // Pré-remplit le formulaire avec les données existantes
        this.projetForm.patchValue({
          nom        : projet.nom,
          description: projet.description,
          date_debut : projet.date_debut,
          date_fin   : projet.date_fin,
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

  onSubmit(): void {
    if (this.projetForm.invalid) return;

    this.saving = true;
    this.errorMessage = '';

    const data = this.projetForm.value;

    if (this.isEditMode) {
      // Mode édition → PUT
      this.projetService.update(this.projetId!, data).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/projets']);
        },
        error: err => {
          this.saving = false;
          this.errorMessage = 'Erreur lors de la modification.';
        }
      });
    } else {
      // Mode création → POST
      this.projetService.create(data).subscribe({
        next: projet => {
          this.saving = false;
          this.router.navigate(['/projets', projet.id]);
        },
        error: err => {
          this.saving = false;
          this.errorMessage = 'Erreur lors de la création.';
        }
      });
    }
  }

  annuler(): void {
    this.router.navigate(['/projets']);
  }
}
