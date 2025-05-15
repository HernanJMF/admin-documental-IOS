import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentsListComponent } from './pages/documents-list.component';

const routes: Routes = [
  {  path: ':status', component: DocumentsListComponent},
  {  path: '', component: DocumentsListComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsListRoutingModule { }
