import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentCardComponent } from './document-card/document-card.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { BasicTableComponent } from './basic-table/basic-table.component';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

@NgModule({
  declarations: [
    DocumentCardComponent,
    BasicTableComponent
  ],
  imports: [
    CommonModule,
    OverlayPanelModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    TooltipModule,
    SkeletonModule
  ],
  exports:[
    DocumentCardComponent,
    BasicTableComponent
  ]
})
export class ConsultModule { }
