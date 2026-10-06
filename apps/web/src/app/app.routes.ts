import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'watch/:id',
    loadComponent: () => import('./pages/watch/watch.component').then(m => m.WatchComponent)
  },
  {
    path: 'series',
    loadComponent: () => import('./pages/series/series.component').then(m => m.SeriesPageComponent)
  },
  {
    path: 'music',
    loadComponent: () => import('./pages/music/music.component').then(m => m.MusicPageComponent)
  },
  {
    path: 'podcasts',
    loadComponent: () => import('./pages/podcasts/podcasts.component').then(m => m.PodcastsPageComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.component').then(m => m.SearchPageComponent)
  },
  {
    path: 'live',
    loadComponent: () => import('./pages/live/live.component').then(m => m.LivePageComponent)
  },
  {
    path: 'studio',
    loadComponent: () => import('./pages/studio/studio.component').then(m => m.StudioComponent)
  },
  {
    path: 'channel/:slug',
    loadComponent: () => import('./pages/channel/channel.component').then(m => m.ChannelComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'status',
    loadComponent: () => import('./pages/status/status.component').then(m => m.StatusComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
