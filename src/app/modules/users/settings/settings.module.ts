import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './pages/settings.component';
import { ConsultModule } from 'src/app/shared/components/consult/consult.module';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { FileUploadModule } from 'primeng/fileupload';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { PasswordModule } from 'primeng/password';
import { BusinessConfigComponent } from './components/business-config/business-config.component';
import { TooltipModule } from 'primeng/tooltip';
import { CarouselModule } from 'primeng/carousel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
  declarations: [
    SettingsComponent,
    ChangePasswordComponent,
    BusinessConfigComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    ConsultModule,
    TabViewModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    PaginatorModule,
    FileUploadModule,
    ReactiveFormsModule,
    PasswordModule,
    TooltipModule,
    ConfirmDialogModule,
    CarouselModule
  ]
})
export class SettingsModule { }
