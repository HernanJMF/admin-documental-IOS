import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { UserService } from 'src/app/core/services/users/user.service';

@Component({
  selector: 'app-basic-table',
  templateUrl: './basic-table.component.html',
  styleUrls: ['./basic-table.component.scss']
})
export class BasicTableComponent implements OnInit {

  //Este metodo es una tabla generica para todo uso que es facilmente editable y usable en combinacion con los archivos JSON

  //Table Configuration
  first = 0;
  rows = 10;

  //Variables
  page:any;
  innerWidth: number;
  messageLabel: any;
  textLabel: string;
  bodyRowData: any;

  //Inputs
  @Input() headerList: any[];
  @Input() dataList: any[] = [];
  @Input() customButtons: any = [];
  @Input() headerCustomButtons: any = [];
  @Input() searchField: any[];
  @Input() rowPerColumn: number = 10;

  @Output() selectedCustomButton = new EventEmitter<any>();
  constructor(
    private configService: ConfigService,
    public userService: UserService
  ) {
    this.page = this.configService.basicTable(this.userService.language);
    this.page = this.page.default;
  }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
  }

  selectCustomButton(id: number, rowData?: any){
    this.selectedCustomButton.emit({ option: id, rowData: rowData })
  }

  titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }

  openOverlay(bodyRowData: any){
    this.bodyRowData = bodyRowData;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }

}
