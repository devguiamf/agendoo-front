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
        path: 'configuracoes',
        loadComponent: () =>
          import('../configuracoes/configuracoes.page').then((m) => m.PrestadorConfiguracoesPage),
      },
      {
        path: '',
        redirectTo: '/prestador/home',
        pathMatch: 'full',
      },
    ],
  },
];

