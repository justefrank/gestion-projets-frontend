import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './tache-list.component.html',
  styleUrl: './tache-list.component.scss'
})
export class TacheListComponent implements OnInit {

  // ── Signals ───────────────────────────────────
  loading        = signal(true);
  taches         = signal<Tache[]>([]);
  projets        = signal<Projet[]>([]);
  searchText     = signal('');
  statutFiltre   = signal<string | null>(null);
  prioriteFiltre = signal<string | null>(null);
  projetFiltre   = signal<string | null>(null);

  // ── Computed ──────────────────────────────────
  tachesFiltrees = computed(() => {
    return this.taches().filter(t => {
      const matchSearch   = t.titre.toLowerCase()
                             .includes(this.searchText().toLowerCase());
      const matchStatut   = this.statutFiltre()
                             ? t.statut === this.statutFiltre() : true;
      const matchPriorite = this.prioriteFiltre()
                             ? t.priorite === this.prioriteFiltre() : true;
      const matchProjet   = this.projetFiltre()
                             ? t.projet === +this.projetFiltre()! : true;
      return matchSearch && matchStatut && matchPriorite && matchProjet;
    });
  });

  stats = computed(() => ({
    total        : this.taches().length,
    aFaire       : this.taches().filter(t => t.statut === 'A_FAIRE').length,
    enCours      : this.taches().filter(t => t.statut === 'EN_COURS').length,
    enRevision   : this.taches().filter(t => t.statut === 'EN_REVISION').length,
    termines     : this.taches().filter(t => t.statut === 'TERMINE').length,
    hautePriorite: this.taches().filter(t =>
                     t.priorite === 'HAUTE' || t.priorite === 'URGENTE'
                   ).length,
  }));

  hasActiveFilters = computed(() =>
    !!this.searchText()    ||
    !!this.statutFiltre()  ||
    !!this.prioriteFiltre()||
    !!this.projetFiltre()
  );

  // ── Données statiques ─────────────────────────
  statuts = [
    { value: 'A_FAIRE',     label: 'À faire',     icon: 'radio_button_unchecked' },
    { value: 'EN_COURS',    label: 'En cours',    icon: 'play_circle'            },
    { value: 'EN_REVISION', label: 'En révision', icon: 'rate_review'            },
    { value: 'TERMINE',     label: 'Terminé',     icon: 'check_circle'           },
  ];

  priorites = [
    { value: 'FAIBLE',  label: 'Faible',  color: '#4caf50' },
    { value: 'NORMALE', label: 'Normale', color: '#2196f3' },
    { value: 'HAUTE',   label: 'Haute',   color: '#ff9800' },
    { value: 'URGENTE', label: 'Urgente', color: '#f44336' },
  ];

  constructor(
    private tacheService: TacheService,
    private projetService: ProjetService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadTaches();
    this.loadProjets();
  }

  // ── Chargement ────────────────────────────────
  loadTaches(): void {
    this.loading.set(true);
    this.tacheService.getAll().subscribe({
      next: taches => {
        this.taches.set(taches);
        this.loading.set(false);
      },
      error: err => {
        console.error('Erreur:', err);
        this.loading.set(false);
      }
    });
  }

  loadProjets(): void {
    this.projetService.getAll().subscribe({
      next: projets => this.projets.set(projets),
      error: err => console.error('Erreur projets:', err)
    });
  }

  // ── Filtres ───────────────────────────────────
  onSearchChange(value: string)   : void { this.searchText.set(value);     }
  onStatutChange(value: string)   : void { this.statutFiltre.set(value);   }
  onPrioriteChange(value: string) : void { this.prioriteFiltre.set(value); }
  onProjetChange(value: string)   : void { this.projetFiltre.set(value);   }

  clearSearch()        : void { this.searchText.set('');     }
  clearStatutFilter()  : void { this.statutFiltre.set(null); }
  clearPrioriteFilter(): void { this.prioriteFiltre.set(null); }
  clearProjetFilter()  : void { this.projetFiltre.set(null); }

  resetFilters(): void {
    this.searchText.set('');
    this.statutFiltre.set(null);
    this.prioriteFiltre.set(null);
    this.projetFiltre.set(null);
  }

  // ── Actions ───────────────────────────────────
  goToNewTask(): void {
    this.router.navigate(['/taches/nouvelle']);
  }

  modifierTache(id: number): void {
    this.router.navigate(['/taches', id, 'modifier']);
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

  changerStatut(tache: Tache, termine: boolean): void {
    const nouveauStatut = termine ? 'TERMINE' : 'EN_COURS';
    this.tacheService.update(tache.id, { statut: nouveauStatut }).subscribe({
      next: () => this.loadTaches(),
      error: err => console.error('Erreur statut:', err)
    });
  }

  // ── Helpers ───────────────────────────────────
  getProjetNom(projetId: number): string {
    const projet = this.projets().find(p => p.id === projetId);
    return projet ? projet.nom : 'Projet inconnu';
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

  getStatutIcon(statut: string): string {
    const icons: any = {
      'A_FAIRE'    : 'radio_button_unchecked',
      'EN_COURS'   : 'play_circle',
      'EN_REVISION': 'rate_review',
      'TERMINE'    : 'check_circle',
    };
    return icons[statut] || 'help';
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

  getPrioriteClass(priorite: string): string {
    const classes: any = {
      'FAIBLE' : 'priorite-faible',
      'NORMALE': 'priorite-normale',
      'HAUTE'  : 'priorite-haute',
      'URGENTE': 'priorite-urgente',
    };
    return classes[priorite] || '';
  }

  getPrioriteColor(priorite: string): string {
    const colors: any = {
      'FAIBLE' : '#4caf50',
      'NORMALE': '#2196f3',
      'HAUTE'  : '#ff9800',
      'URGENTE': '#f44336',
    };
    return colors[priorite] || '#999';
  }

  isDateUrgente(date: string): boolean {
    const diff = new Date(date).getTime() - new Date().getTime();
    return diff < 3 * 24 * 60 * 60 * 1000;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  getProgressPercentage(tache: Tache): number {
    if (!tache.date_limite) return 0;
    const fin   = new Date(tache.date_limite).getTime();
    const now   = Date.now();
    if (fin <= now) return 100;
    const total = fin - now;
    return Math.min(Math.round((now / total) * 100), 100);
  }
}
