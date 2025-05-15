import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersManagementComponent } from './pages/users-management.component';
import { UserDocumentsComponent } from './components/user-documents/user-documents.component';
import { CheckRoleGuard } from 'src/app/core/guards/role/check-role.guard';

const routes: Routes = [
  { path: '', component: UsersManagementComponent},
  { path: ':topic', component: UsersManagementComponent},
  { path: ':email/documents', 
    component: UserDocumentsComponent,
    canActivate:[CheckRoleGuard],
    data: {
      roles: ['ADMIN']
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersManagementRoutingModule { }
