import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckLoginGuard } from './core/guards/check-login.guard';
import { CheckRoleGuard } from './core/guards/role/check-role.guard';
import { ActiveDirectoryGuard } from './core/guards/active-directory-login/active-directory-login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/security/login/login.module').then(
        (m) => m.LoginModule
      ),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./modules/home/main.module').then((m) => m.MainModule),
    canActivate: [ActiveDirectoryGuard, CheckLoginGuard, CheckRoleGuard],
    data: {
      roles: ['CLIENT', 'ADMIN'],
    },
  },
  {
    path: 'documents',
    loadChildren: () =>
      import('./modules/documents/documents-list/documents-list.module').then(
        (m) => m.DocumentsListModule
      ),
    canActivate: [CheckLoginGuard, CheckRoleGuard],
    data: {
      roles: ['CLIENT', 'ADMIN'],
    },
  },
  {
    path: 'chat-analyzer',
    loadChildren: () =>
      import('./modules/documents/chat-analyzer/chat-analyzer.module').then(
        (m) => m.ChatAnalyzerModule
      ),
    canActivate: [CheckLoginGuard, CheckRoleGuard],
    data: {
      roles: ['CLIENT', 'ADMIN'],
    },
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./modules/users/users-management/users-management.module').then(
        (m) => m.UsersManagementModule
      ),
    canActivate: [CheckLoginGuard, CheckRoleGuard],
    data: {
      roles: ['ADMIN'],
    },
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./modules/users/settings/settings.module').then(
        (m) => m.SettingsModule
      ),
    canActivate: [CheckLoginGuard, CheckRoleGuard],
    data: {
      roles: ['CLIENT', 'ADMIN'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
