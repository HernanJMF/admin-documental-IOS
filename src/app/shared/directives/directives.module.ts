import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropDirective } from './drap-drop/drag-drop.directive';

@NgModule({
  declarations: [
    DragDropDirective
  ],
  imports: [
    CommonModule
  ],
  exports:[
    DragDropDirective
  ]
})
export class DirectivesModule { }
