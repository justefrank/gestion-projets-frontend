import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  menuItems = [
    {
      label   : 'Tableau de bord',
      icon    : 'space_dashboard',
      route   : '/dashboard',
    
    },
    {
      label   : 'Projets',
      icon    : 'folder_open',
      route   : '/projets',

    },
    {
      label   : 'Mes Tâches',
      icon    : 'check_box',
      route   : '/taches',

    },
  ];

  constructor(public authService: AuthService) {}
}
