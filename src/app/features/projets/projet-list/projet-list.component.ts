import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ProjetService } from '../../../core/services/projet.service';
import { Projet } from '../../../core/models';

@Component({
  selector: 'app-projet-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './projet-list.component.html',
  styleUrl: './projet-list.component.scss'
})
export class ProjetListComponent implements OnInit {

  projets: Projet[] = [];
  projetsFiltres: Projet[] = [];
  loading = true;

  // Filtres
  searchText = '';
  statutFiltre = '';

  statuts = [
    { value: '',           label: 'Tous les statuts' },
    { value: 'EN_ATTENTE', label: 'En attente'       },
    { value: 'EN_COURS',   label: 'En cours'         },
    { value: 'TERMINE',    label: 'Terminé'          },
    { value: 'ANNULE',     label: 'Annulé'           },
  ];

  constructor(
    private projetService: ProjetService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjets();
  }

  loadProjets(): void {
    this.loading = true;
    this.projetService.getAll().subscribe({
      next: projets => {
        this.projets = projets;
        this.projetsFiltres = projets;
        this.loading = false;
      },
      error: err => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  // Filtre en temps réel
  appliquerFiltres(): void {
    this.projetsFiltres = this.projets.filter(p => {
      const matchSearch = p.nom.toLowerCase()
                           .includes(this.searchText.toLowerCase());
      const matchStatut = this.statutFiltre
                           ? p.statut === this.statutFiltre
                           : true;
      return matchSearch && matchStatut;
    });
  }

  supprimerProjet(id: number, event: Event): void {
    event.stopPropagation(); // empêche la navigation vers le détail
    if (confirm('Supprimer ce projet ?')) {
      this.projetService.delete(id).subscribe({
        next: () => this.loadProjets(),
        error: err => console.error('Erreur suppression:', err)
      });
    }
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'EN_ATTENTE': 'badge-warning',
      'EN_COURS'  : 'badge-info',
      'TERMINE'   : 'badge-success',
      'ANNULE'    : 'badge-danger',
    };
    return classes[statut] || '';
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS'  : 'En cours',
      'TERMINE'   : 'Terminé',
      'ANNULE'    : 'Annulé',
    };
    return labels[statut] || statut;
  }
}
