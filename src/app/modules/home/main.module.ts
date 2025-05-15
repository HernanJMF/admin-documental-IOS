import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './pages/main.component';
import { ConsultModule } from 'src/app/shared/components/consult/consult.module';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { DocumentsListModule } from '../documents/documents-list/documents-list.module';




@NgModule({
  declarations: [
    MainComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    ConsultModule,
    ButtonModule,
    CarouselModule,
    DocumentsListModule
  ]
})
export class MainModule { }
