// ─────────────────────────────────────────────
// INTERFACES — reflètent exactement les modèles Django
// ─────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface MembreProjet {
  id: number;
  projet: number;
  user: number;
  user_detail: User;
  role: 'DEVELOPPEUR' | 'DESIGNER' | 'TESTEUR' | 'CHEF';
}

export interface Commentaire {
  id: number;
  tache: number;
  auteur: number;
  auteur_detail: User;
  contenu: string;
  created_at: string;
}

export interface Document {
  id: number;
  projet: number;
  tache?: number;
  nom: string;
  fichier: string;
  taille: number;
  uploaded_by: number;
  uploaded_by_detail: User;
  created_at: string;
}

export interface Tache {
  id: number;
  projet: number;
  titre: string;
  description: string;
  priorite: 'FAIBLE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  statut: 'A_FAIRE' | 'EN_COURS' | 'EN_REVISION' | 'TERMINE';
  date_limite: string;
  assignee: number;
  assignee_detail: User;
  commentaires: Commentaire[];
  documents: Document[];
  created_at: string;
  updated_at: string;
}

export interface Projet {
  id: number;
  nom: string;
  description: string;
  date_debut: string;
  date_fin: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  chef_projet: number;
  chef_projet_detail: User;
  membres: MembreProjet[];
  taches: Tache[];
  documents: Document[];
  progression: number;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  total_projets: number;
  projets_en_cours: number;
  projets_termines: number;
  projets_en_retard: number;
  total_taches: number;
  mes_taches: number;
  taches_urgentes: number;
  taches_en_retard: number;
  repartition_taches: {
    a_faire: number;
    en_cours: number;
    en_revision: number;
    termine: number;
  };
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
