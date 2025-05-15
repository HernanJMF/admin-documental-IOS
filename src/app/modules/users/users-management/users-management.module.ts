import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UsersManagementRoutingModule } from './users-management-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { UsersManagementComponent } from './pages/users-management.component';
import { ConsultModule } from 'src/app/shared/components/consult/consult.module';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { TopicsComponent } from './components/topics/topics.component';
import { DialogModule } from 'primeng/dialog';
import { ChipModule } from 'primeng/chip';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { UserDocumentsComponent } from './components/user-documents/user-documents.component';
import { TooltipModule } from 'primeng/tooltip';
import { DocumentsListModule } from '../../documents/documents-list/documents-list.module';

@NgModule({
  declarations: [UsersManagementComponent, CreateUserComponent, TopicsComponent, UserDocumentsComponent],
  imports: [
    CommonModule,
    UsersManagementRoutingModule,
    ButtonModule,
    InputTextModule,
    PaginatorModule,
    ConsultModule,
    ChipModule,
    DropdownModule,
    ReactiveFormsModule,
    DialogModule,
    MultiSelectModule,
    InputSwitchModule,
    ConfirmDialogModule,
    ToastModule,
    TabViewModule,
    OverlayPanelModule,
    DocumentsListModule,
    TooltipModule
  ]
})
export class UsersManagementModule { }
