import { Routes } from '@angular/router';
import { ClienteTabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: ClienteTabsPage,
    children: [
      {
        path: 'busca',
        loadComponent: () =>
          import('../busca/busca.page').then((m) => m.ClienteBuscaPage),
      },
      {
        path: 'agendamentos',
        loadComponent: () =>
          import('../agendamentos/agendamentos.page').then((m) => m.ClienteAgendamentosPage),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../perfil/perfil.page').then((m) => m.ClientePerfilPage),
      },
      {
        path: 'agendar/:id',
        loadComponent: () =>
          import('../agendar/agendar.page').then((m) => m.ClienteAgendarPage),
      },
      {
        path: '',
        redirectTo: '/cliente/busca',
        pathMatch: 'full',
      },
    ],
  },
];

