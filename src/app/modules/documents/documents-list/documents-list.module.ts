import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentsListRoutingModule } from './documents-list-routing.module';
import { DocumentsListComponent } from './pages/documents-list.component';
import { ConsultModule } from 'src/app/shared/components/consult/consult.module';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { FileUploadModule } from 'primeng/fileupload';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';

@NgModule({
  declarations: [
    DocumentsListComponent,
    DocumentUploadComponent
  ],
  imports: [
    CommonModule,
    DocumentsListRoutingModule,
    ConsultModule,
    TabViewModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    PaginatorModule,
    FileUploadModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextareaModule,
    ScrollPanelModule,
    ChipModule,
    TooltipModule,
    DirectivesModule
  ],
  exports: [
    DocumentsListComponent,
    DocumentUploadComponent
  ]
})
export class DocumentsListModule { }
