import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatAnalyzerRoutingModule } from './chat-analyzer-routing.module';
import { ChatAnalyzerComponent } from './pages/chat-analyzer.component';
import { ChatComponent } from './components/chat/chat.component';
import { FormsModule } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DocumentsComponent } from './components/documents/documents.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DocumentsListModule } from '../documents-list/documents-list.module';
import { SelectButtonModule } from 'primeng/selectbutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ClipboardModule } from 'ngx-clipboard';
import { DropdownModule } from 'primeng/dropdown';
import { ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    ChatAnalyzerComponent,
    ChatComponent,
    DocumentsComponent
  ],
  imports: [
    CommonModule,
    ChatAnalyzerRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextareaModule,
    ScrollPanelModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DocumentsListModule,
    SelectButtonModule,
    OverlayPanelModule,
    ConfirmDialogModule,
    ClipboardModule,
    DropdownModule,
    ImageModule,
    TooltipModule
  ]
})
export class ChatAnalyzerModule { }
