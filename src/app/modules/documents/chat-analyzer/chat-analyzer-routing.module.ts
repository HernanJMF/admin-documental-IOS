import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatAnalyzerComponent } from './pages/chat-analyzer.component';
import { CheckRoleGuard } from 'src/app/core/guards/role/check-role.guard';

const routes: Routes = [
  { path: ':type/:documentID', component: ChatAnalyzerComponent},
  { path: ':type/:documentID/:subDocument', component: ChatAnalyzerComponent},
  { path: ':type/:documentID/user/:email', 
    component: ChatAnalyzerComponent,
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
export class ChatAnalyzerRoutingModule { }
