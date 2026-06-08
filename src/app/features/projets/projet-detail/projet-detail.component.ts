import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ProjetService } from '../../../core/services/projet.service';
import { TacheService } from '../../../core/services/tache.service';
import { Projet, Tache } from '../../../core/models';

@Component({
  selector: 'app-projet-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './projet-detail.component.html',
  styleUrl: './projet-detail.component.scss'
})
export class ProjetDetailComponent implements OnInit {

  projet: Projet | null = null;
  taches: Tache[] = [];
  loading = true;
  projetId!: number;

  // Tâches groupées par statut (vue Kanban)
  tachesParStatut: { [key: string]: Tache[] } = {
    'A_FAIRE'    : [],
    'EN_COURS'   : [],
    'EN_REVISION': [],
    'TERMINE'    : [],
  };

  colonnes = [
    { key: 'A_FAIRE',     label: 'À faire',     icon: 'radio_button_unchecked', color: '#888'    },
    { key: 'EN_COURS',    label: 'En cours',    icon: 'play_circle',            color: '#1976d2' },
    { key: 'EN_REVISION', label: 'En révision', icon: 'rate_review',            color: '#f57c00' },
    { key: 'TERMINE',     label: 'Terminé',     icon: 'check_circle',           color: '#388e3c' },
  ];

  constructor(
    private projetService: ProjetService,
    private tacheService: TacheService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.projetId = +this.route.snapshot.params['id'];
    this.loadProjet();
    this.loadTaches();
  }

  loadProjet(): void {
    this.projetService.getById(this.projetId).subscribe({
      next: projet => {
        this.projet = projet;
        this.loading = false;
      },
      error: err => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  loadTaches(): void {
    this.tacheService.getAll({ projet: this.projetId }).subscribe({
      next: taches => {
        this.taches = taches;
        this.grouperTachesParStatut();
      },
      error: err => console.error('Erreur tâches:', err)
    });
  }

  grouperTachesParStatut(): void {
    // Réinitialise les groupes
    this.tachesParStatut = {
      'A_FAIRE'    : [],
      'EN_COURS'   : [],
      'EN_REVISION': [],
      'TERMINE'    : [],
    };
    // Groupe chaque tâche selon son statut
    this.taches.forEach(tache => {
      if (this.tachesParStatut[tache.statut]) {
        this.tachesParStatut[tache.statut].push(tache);
      }
    });
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

  getPrioriteClass(priorite: string): string {
    const classes: any = {
      'FAIBLE' : 'priorite-faible',
      'NORMALE': 'priorite-normale',
      'HAUTE'  : 'priorite-haute',
      'URGENTE': 'priorite-urgente',
    };
    return classes[priorite] || '';
  }

  supprimerProjet(): void {
    if (confirm('Supprimer ce projet et toutes ses tâches ?')) {
      this.projetService.delete(this.projetId).subscribe({
        next: () => this.router.navigate(['/projets']),
        error: err => console.error('Erreur suppression:', err)
      });
    }
  }
}
