import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import { ProjetService } from '../../core/services/projet.service';
import { AuthService } from '../../core/services/auth.service';
import { Dashboard, Projet } from '../../core/models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: Dashboard | null = null;
  projetsRecents: Projet[] = [];

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService,
    private projetService: ProjetService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadProjets();
  }

  loadStats(): void {
    this.dashboardService.get().subscribe({
      next: data => {
        this.stats = data;
        setTimeout(() => this.initChart(), 100);
      },
      error: err => console.error('Erreur dashboard:', err)
    });
  }

  loadProjets(): void {
    this.projetService.getAll().subscribe({
      next: projets => this.projetsRecents = projets.slice(0, 5),
      error: err => console.error('Erreur projets:', err)
    });
  }

  initChart(): void {
    if (!this.stats) return;
    const ctx = document.getElementById('tachesChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['À faire', 'En cours', 'En révision', 'Terminées'],
        datasets: [{
          data: [
            this.stats.repartition_taches.a_faire,
            this.stats.repartition_taches.en_cours,
            this.stats.repartition_taches.en_revision,
            this.stats.repartition_taches.termine,
          ],
          backgroundColor: ['#667eea', '#43e97b', '#f6d365', '#f5576c'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
