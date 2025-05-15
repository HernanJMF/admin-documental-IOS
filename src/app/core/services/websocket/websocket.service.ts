import { Injectable } from '@angular/core';
import * as Rx from 'rxjs';
import { retry, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  //Este servicio contiene todos los metodos necesarios para crear una conexion con el websocket y se puedan hablar mediante chat

  private subject: Rx.Subject<MessageEvent>;

  constructor() { }

  //este metodo se ejecuta apenas cargue la pantalla para iniciar la conexion con el back
  public connect(url: any, reconnect: boolean = false): Rx.Subject<MessageEvent>{
    this.subject = reconnect ? undefined : this.subject
    if(!this.subject){
      this.subject = this.create(url);
    }
    return this.subject
  }

  //valida que haya una conexion creada y si no la hay la crea
  private create(url): Rx.Subject<MessageEvent>{
    let ws = new WebSocket(url);

    let observable = Rx.Observable.create(
      (obs: Rx.Subject<MessageEvent>) =>{
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.error.bind(obs);
        ws.onclose = obs.complete.bind(obs);
        return ws.close.bind(ws)
      }
    )/*.pipe(
      share(),
      retry()
    )*/;

    let observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN){
          ws.send(JSON.stringify(data))
        }
      }
    }

    return Rx.Subject.create(observer, observable)

  }
   
}
