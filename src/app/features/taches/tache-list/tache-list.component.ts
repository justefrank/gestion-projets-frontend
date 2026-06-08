import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { TacheService } from '../../../core/services/tache.service';
import { ProjetService } from '../../../core/services/projet.service';
import { Tache, Projet } from '../../../core/models';

@Component({
  selector: 'app-tache-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
  ],
  templateUrl: './tache-list.component.html',
  styleUrl: './tache-list.component.scss'
})
export class TacheListComponent implements OnInit {

  taches: Tache[] = [];
  tachesFiltrees: Tache[] = [];
  projets: Projet[] = [];
  loading = true;

  // Filtres
  searchText   = '';
  statutFiltre = '';
  prioriteFiltre = '';
  projetFiltre = '';

  statuts = [
    { value: '',           label: 'Tous les statuts' },
    { value: 'A_FAIRE',    label: 'À faire'          },
    { value: 'EN_COURS',   label: 'En cours'         },
    { value: 'EN_REVISION',label: 'En révision'      },
    { value: 'TERMINE',    label: 'Terminé'          },
  ];

  priorites = [
    { value: '',        label: 'Toutes les priorités' },
    { value: 'FAIBLE',  label: 'Faible'               },
    { value: 'NORMALE', label: 'Normale'              },
    { value: 'HAUTE',   label: 'Haute'                },
    { value: 'URGENTE', label: 'Urgente'              },
  ];

  constructor(
    private tacheService: TacheService,
    private projetService: ProjetService,
    public router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTaches();
    this.loadProjets();
  }

  loadTaches(): void {
    this.loading = true;
    this.tacheService.getAll().subscribe({
      next: taches => {
        this.taches = taches;
        this.tachesFiltrees = taches;
        this.loading = false;
      },
      error: err => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  loadProjets(): void {
    this.projetService.getAll().subscribe({
      next: projets => this.projets = projets,
      error: err => console.error('Erreur projets:', err)
    });
  }

  appliquerFiltres(): void {
    this.tachesFiltrees = this.taches.filter(t => {
      const matchSearch   = t.titre.toLowerCase()
                             .includes(this.searchText.toLowerCase());
      const matchStatut   = this.statutFiltre
                             ? t.statut === this.statutFiltre : true;
      const matchPriorite = this.prioriteFiltre
                             ? t.priorite === this.prioriteFiltre : true;
      const matchProjet   = this.projetFiltre
                             ? t.projet === +this.projetFiltre : true;
      return matchSearch && matchStatut && matchPriorite && matchProjet;
    });
  }

  supprimerTache(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Supprimer cette tâche ?')) {
      this.tacheService.delete(id).subscribe({
        next: () => this.loadTaches(),
        error: err => console.error('Erreur suppression:', err)
      });
    }
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'A_FAIRE'    : 'badge-default',
      'EN_COURS'   : 'badge-info',
      'EN_REVISION': 'badge-warning',
      'TERMINE'    : 'badge-success',
    };
    return classes[statut] || '';
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      'A_FAIRE'    : 'À faire',
      'EN_COURS'   : 'En cours',
      'EN_REVISION': 'En révision',
      'TERMINE'    : 'Terminé',
    };
    return labels[statut] || statut;
  }

  getPrioriteClass(priorite: string): string {
    const classes: any = {
      'FAIBLE' : 'priorite-faible',
      'NORMALE': 'priorite-normale',
      'HAUTE'  : 'priorite-haute',
      'URGENTE': 'priorite-urgente',
    };
    return classes[priorite] || '';
  }

  getProjetNom(projetId: number): string {
    const projet = this.projets.find(p => p.id === projetId);
    return projet ? projet.nom : 'Projet inconnu';
  }
}
