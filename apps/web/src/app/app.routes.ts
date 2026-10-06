import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LiveComponent } from './pages/live/live.component';
import { StudioComponent } from './pages/studio/studio.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { StatusComponent } from './pages/status/status.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Moyo — Regarder. Écouter. Créer. Diffuser.' },
  { path: 'live', component: LiveComponent, title: 'Moyo — Diffusions en direct' },
  { path: 'studio', component: StudioComponent, title: 'Moyo Studio — Espace Créateur' },
  { path: 'auth/login', component: LoginComponent, title: 'Connexion — Moyo' },
  { path: 'auth/register', component: RegisterComponent, title: 'Créer un compte — Moyo' },
  { path: 'status', component: StatusComponent, title: 'État de l\'instance — Moyo' },
  { path: '**', redirectTo: '' },
];
