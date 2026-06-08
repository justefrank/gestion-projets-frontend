import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './projet-detail.component.html',
  styleUrl: './projet-detail.component.scss'
})
export class ProjetDetailComponent implements OnInit {

  projet: Projet | null = null;
  taches: Tache[] = [];
  loading = true;
  projetId!: number;

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

  private gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #f6d365, #fda085)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
  ];

  private avatarColors = [
    '#667eea', '#43e97b', '#f6d365',
    '#f093fb', '#4facfe', '#f5576c',
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

  // ── Chargement ────────────────────────────────
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
    this.tachesParStatut = {
      'A_FAIRE'    : [],
      'EN_COURS'   : [],
      'EN_REVISION': [],
      'TERMINE'    : [],
    };
    this.taches.forEach(tache => {
      if (this.tachesParStatut[tache.statut]) {
        this.tachesParStatut[tache.statut].push(tache);
      }
    });
  }

  // ── Dates ─────────────────────────────────────
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  formatRelativeDate(date: string): string {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    if (days < 30)  return `Il y a ${days} jours`;
    if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
    return `Il y a ${Math.floor(days / 365)} an(s)`;
  }

  getRemainingDays(): number | null {
    if (!this.projet) return null;
    const diff = new Date(this.projet.date_fin).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // ── Statuts ───────────────────────────────────
  getStatutLabel(statut: string): string {
    const labels: any = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS'  : 'En cours',
      'TERMINE'   : 'Terminé',
      'ANNULE'    : 'Annulé',
      'A_FAIRE'   : 'À faire',
      'EN_REVISION': 'En révision',
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'EN_ATTENTE' : 'status-warning',
      'EN_COURS'   : 'status-info',
      'TERMINE'    : 'status-success',
      'ANNULE'     : 'status-danger',
      'A_FAIRE'    : 'status-default',
      'EN_REVISION': 'status-warning',
    };
    return classes[statut] || '';
  }

  getStatutIcon(statut: string): string {
    const icons: any = {
      'EN_ATTENTE' : 'hourglass_empty',
      'EN_COURS'   : 'play_circle',
      'TERMINE'    : 'check_circle',
      'ANNULE'     : 'cancel',
      'A_FAIRE'    : 'radio_button_unchecked',
      'EN_REVISION': 'rate_review',
    };
    return icons[statut] || 'help';
  }

  // ── Priorités ─────────────────────────────────
  getPrioriteLabel(priorite: string): string {
    const labels: any = {
      'FAIBLE' : 'Faible',
      'NORMALE': 'Normale',
      'HAUTE'  : 'Haute',
      'URGENTE': 'Urgente',
    };
    return labels[priorite] || priorite;
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

  // ── Progression ───────────────────────────────
  getProgressColor(progression: number): string {
    if (progression >= 100) return 'accent';
    if (progression >= 50)  return 'primary';
    return 'warn';
  }

  // ── Rôles ─────────────────────────────────────
  getRoleLabel(role: string): string {
    const labels: any = {
      'DEVELOPPEUR': 'Développeur',
      'DESIGNER'   : 'Designer',
      'TESTEUR'    : 'Testeur',
      'CHEF'       : 'Chef de projet',
    };
    return labels[role] || role;
  }

  // ── Helpers visuels ───────────────────────────
  getGradientColor(id: number): string {
    return this.gradients[id % this.gradients.length];
  }

  getAvatarColor(id: number): string {
    return this.avatarColors[id % this.avatarColors.length];
  }

  // ── Suppression ───────────────────────────────
  supprimerProjet(): void {
    if (confirm('Supprimer ce projet et toutes ses tâches ?')) {
      this.projetService.delete(this.projetId).subscribe({
        next: () => this.router.navigate(['/projets']),
        error: err => console.error('Erreur suppression:', err)
      });
    }
  }
}
