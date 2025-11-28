import { Routes } from '@angular/router';
import { PrestadorTabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: PrestadorTabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.PrestadorHomePage),
      },
      {
        path: 'servicos',
        loadComponent: () =>
          import('../servicos/servicos.page').then((m) => m.PrestadorServicosPage),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../perfil/perfil.page').then((m) => m.PrestadorPerfilPage),
      },
      {
        path: 'loja',
        loadComponent: () =>
          import('../loja/loja.page').then((m) => m.PrestadorLojaPage),
      },
      {
        path: '',
        redirectTo: '/prestador/home',
        pathMatch: 'full',
      },
    ],
  },
];

