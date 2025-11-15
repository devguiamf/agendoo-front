import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'prestador',
    loadComponent: () =>
      import('./prestador/tabs/tabs.page').then((m) => m.PrestadorTabsPage),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./prestador/home/home.page').then((m) => m.PrestadorHomePage),
      },
      {
        path: 'servicos',
        loadComponent: () =>
          import('./prestador/servicos/servicos.page').then((m) => m.PrestadorServicosPage),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./prestador/perfil/perfil.page').then((m) => m.PrestadorPerfilPage),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./prestador/configuracoes/configuracoes.page').then((m) => m.PrestadorConfiguracoesPage),
      },
    ],
  },
];
