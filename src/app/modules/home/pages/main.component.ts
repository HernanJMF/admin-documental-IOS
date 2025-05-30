import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { DocumentsListService } from 'src/app/core/services/documents-list/documents-list.service';
import { LocalStorageService } from 'src/app/core/services/localStorage/local-storage.service';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/users/user.service';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from 'src/app/core/services/config/config.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  page: any;
  userName: string = '';
  innerWidth: number;
  documentList: any = [];
  documentsCount: number = 0;
  plan: string = '';
  responsiveOptions = [
    {
      breakpoint: '1200px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '992px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '576px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private documentsListService: DocumentsListService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService,
    protected router: Router
  ) {
    this.page = this.configService.main(this.userService.language);
    this.page = this.page.default;
    this.plan = this.userService.plan;
    this.loadDocumentList();

    this.innerWidth = window.innerWidth;
  }

  loadDocumentList(){ //obtiene la lista de documentos recientes
    this.documentsListService.GetRecentDocument().subscribe({
      next: (res) => {
          
        this.documentList = res.sort((a, b) => {
          const dateA = new Date(a.last_interaction).getTime();
          const dateB = new Date(b.last_interaction).getTime();
        });
      },
      error: () => {
        const notification: ToastNotification = {
          title: this.page.loadDocumentList_error.title,
          content: this.page.loadDocumentList_error.content,
          success_status: false,
        };
        this.messageService.Notify(notification);
      }
    });
  }


  ngOnInit(): void {
    // Obtén el firstName del local storage
    const userData = this.localStorageService.getJSON('user_settings');
    const firstName = userData.firstName;

    // Asigna el valor de firstName a userName
    if (firstName) {
      this.userName = firstName;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
  }
}
