import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjetService } from '../../../core/services/projet.service';
import { TacheService } from '../../../core/services/tache.service';
import { Projet, Tache } from '../../../core/models';

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
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './projet-list.component.html',
  styleUrl: './projet-list.component.scss'
})
export class ProjetListComponent implements OnInit {

  projets: Projet[] = [];
  projetsFiltres: Projet[] = [];
  taches: Tache[] = [];
  loading = true;

  searchText   = '';
  statutFiltre = '';

  statuts = [
    { value: '',           label: 'Tous',       icon: 'list',         color: '#888'    },
    { value: 'EN_ATTENTE', label: 'En attente', icon: 'hourglass_empty', color: '#f57c00' },
    { value: 'EN_COURS',   label: 'En cours',   icon: 'play_circle',  color: '#1976d2' },
    { value: 'TERMINE',    label: 'Terminé',    icon: 'check_circle', color: '#388e3c' },
    { value: 'ANNULE',     label: 'Annulé',     icon: 'cancel',       color: '#c62828' },
  ];

  // Gradients pour les icônes de projet
  private gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #f6d365, #fda085)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
  ];

  constructor(
    private projetService: ProjetService,
    private tacheService: TacheService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjets();
    this.loadTaches();
  }

  // ── Chargement ────────────────────────────────
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

  loadTaches(): void {
    this.tacheService.getAll().subscribe({
      next: taches => this.taches = taches,
      error: err => console.error('Erreur tâches:', err)
    });
  }

  // ── Filtres ───────────────────────────────────
  appliquerFiltres(): void {
    this.projetsFiltres = this.projets.filter(p => {
      const matchSearch = p.nom.toLowerCase()
                           .includes(this.searchText.toLowerCase());
      const matchStatut = this.statutFiltre
                           ? p.statut === this.statutFiltre : true;
      return matchSearch && matchStatut;
    });
  }

  hasActiveFilters(): boolean {
    return !!this.searchText || !!this.statutFiltre;
  }

  resetFilters(): void {
    this.searchText   = '';
    this.statutFiltre = '';
    this.appliquerFiltres();
  }

  // ── Navigation ────────────────────────────────
  goToNewProject(): void {
    this.router.navigate(['/projets/nouveau']);
  }

  // ── Suppression ───────────────────────────────
  supprimerProjet(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Supprimer ce projet et toutes ses tâches ?')) {
      this.projetService.delete(id).subscribe({
        next: () => this.loadProjets(),
        error: err => console.error('Erreur suppression:', err)
      });
    }
  }

  // ── Statistiques globales ─────────────────────
  getGlobalProgress(): number {
    if (this.projets.length === 0) return 0;
    const total = this.projets.reduce((sum, p) => sum + p.progression, 0);
    return Math.round(total / this.projets.length);
  }

  getActiveProjects(): number {
    return this.projets.filter(p => p.statut === 'EN_COURS').length;
  }

  getCompletedProjects(): number {
    return this.projets.filter(p => p.statut === 'TERMINE').length;
  }

  getAverageProgress(): number {
    return this.getGlobalProgress();
  }

  // ── Tâches par projet ─────────────────────────
  getTaskCount(projetId: number): number {
    return this.taches.filter(t => t.projet === projetId).length;
  }

  getRemainingTasks(projetId: number): number {
    return this.taches.filter(
      t => t.projet === projetId && t.statut !== 'TERMINE'
    ).length;
  }

  // ── Dates ─────────────────────────────────────
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  getDaysRemaining(dateFin: string): number {
    const diff = new Date(dateFin).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getRemainingText(dateFin: string): string {
    const days = this.getDaysRemaining(dateFin);
    if (days < 0)  return `${Math.abs(days)} jour(s) de retard`;
    if (days === 0) return 'Échéance aujourd\'hui';
    return `${days} jour(s) restant(s)`;
  }

  // ── Helpers statut ────────────────────────────
  getStatutLabel(statut: string): string {
    const s = this.statuts.find(s => s.value === statut);
    return s ? s.label : statut;
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'EN_ATTENTE': 'status-warning',
      'EN_COURS'  : 'status-info',
      'TERMINE'   : 'status-success',
      'ANNULE'    : 'status-danger',
    };
    return classes[statut] || '';
  }

  getStatutIcon(statut: string): string {
    const s = this.statuts.find(s => s.value === statut);
    return s ? s.icon : 'help';
  }

  getStatutColor(statut: string): string {
    const s = this.statuts.find(s => s.value === statut);
    return s ? s.color : '#888';
  }

  // ── Helpers visuel ────────────────────────────
  getGradientColor(id: number): string {
    return this.gradients[id % this.gradients.length];
  }

  getProgressColor(progression: number): string {
    if (progression >= 100) return 'accent';
    if (progression >= 50)  return 'primary';
    return 'warn';
  }
}
