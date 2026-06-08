import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── Routes publiques ──────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent)
  },

  // ── Routes protégées avec Layout ──────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/layout.component')
        .then(m => m.LayoutComponent),
    children: [
      // Redirection par défaut
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      // Projets
      {
        path: 'projets',
        loadComponent: () =>
          import('./features/projets/projet-list/projet-list.component')
            .then(m => m.ProjetListComponent)
      },
      {
        path: 'projets/nouveau',
        loadComponent: () =>
          import('./features/projets/projet-form/projet-form.component')
            .then(m => m.ProjetFormComponent)
      },
      {
        path: 'projets/:id',
        loadComponent: () =>
          import('./features/projets/projet-detail/projet-detail.component')
            .then(m => m.ProjetDetailComponent)
      },
      {
        path: 'projets/:id/modifier',
        loadComponent: () =>
          import('./features/projets/projet-form/projet-form.component')
            .then(m => m.ProjetFormComponent)
      },

      // Tâches
      {
        path: 'taches',
        loadComponent: () =>
          import('./features/taches/tache-list/tache-list.component')
            .then(m => m.TacheListComponent)
      },

      {
        path: 'taches/nouvelle',
        loadComponent: () =>
          import('./features/taches/tache-form/tache-form.component')
            .then(m => m.TacheFormComponent)
      },
      {
        path: 'taches/:id/modifier',
        loadComponent: () =>
          import('./features/taches/tache-form/tache-form.component')
            .then(m => m.TacheFormComponent)
      },
    ]
  },

  // Route inconnue
  { path: '**', redirectTo: 'dashboard' }
];
