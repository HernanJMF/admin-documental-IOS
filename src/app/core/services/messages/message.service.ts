import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastNotification } from '../../../shared/types/ToastNotification';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  //Este servicio activa el toast (mensaje) informativo en la parte superior derecha

  //attributes
  public trigger: Subject<ToastNotification> = new Subject<ToastNotification>();

  //constructor
  constructor() {}

  //methods
  public Notify(notification: ToastNotification): void {
    this.trigger.next(notification);
  }
}
