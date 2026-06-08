import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  pageTitle = 'Tableau de bord';

  // Correspondance entre les routes et les titres
  private pageTitles: { [key: string]: string } = {
    '/dashboard'        : 'Tableau de bord',
    '/projets'          : 'Mes Projets',
    '/projets/nouveau'  : 'Nouveau Projet',
    '/taches'           : 'Mes Tâches',
    '/taches/nouvelle'  : 'Nouvelle Tâche',
  };

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Écoute les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects)
    ).subscribe(url => {
      this.updateTitle(url);
    });

    // Titre au chargement initial
    this.updateTitle(this.router.url);
  }

  updateTitle(url: string): void {
    // Cherche d'abord une correspondance exacte
    if (this.pageTitles[url]) {
      this.pageTitle = this.pageTitles[url];
      return;
    }

    // Correspondances dynamiques (routes avec ID)
    if (url.match(/\/projets\/\d+\/modifier/)) {
      this.pageTitle = 'Modifier le Projet';
    } else if (url.match(/\/projets\/\d+/)) {
      this.pageTitle = 'Détail du Projet';
    } else if (url.match(/\/taches\/\d+\/modifier/)) {
      this.pageTitle = 'Modifier la Tâche';
    } else {
      this.pageTitle = 'Gestion de Projets';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
