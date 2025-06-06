import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/core/services/loading/loading-service.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  //Este metodo es la vista de la animacion generica de carga
  
  show = false;
  hasError = false;

  constructor(private loadingService: LoadingService) {
    this.loadingService.showEvent.subscribe(isShown => {
      this.show = isShown;
    });
  }

  ngOnInit() {
  }

}
