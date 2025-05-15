import { Component, Input, ViewChild, OnInit, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { DocumentsListService } from 'src/app/core/services/documents-list/documents-list.service';
import { DocumentUploadComponent } from '../components/document-upload/document-upload.component';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';


import { UserService } from 'src/app/core/services/users/user.service';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/core/services/loading/loading-service.service';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { UsersManagementService } from 'src/app/core/services/users-management/users-management.service';

@Component({
  selector: 'app-documents-list',
  templateUrl: './documents-list.component.html',
  styleUrls: ['./documents-list.component.scss']

})
export class DocumentsListComponent implements OnInit{

  //page variables
  page:any;
  activeIndex: number = 0;
  search: string = "";
  statusParamMap: any = this.route.snapshot.paramMap.get('status');
  showLoader: boolean = true;

  searchTopic: string = "";
  //dropdown variables
  sortBy: any = "";
  sortByTopic: any = "";
  sortList = [ ];

  sortTopicList = [];

  //pagination variables
  first: number = 0;
  rows: number = 12;
  isValid: boolean = false;

  topicList: any[] = [];
  originalTopicList: any[] = [];
  documentList: any = [];
  originalDocumentList: any = [];
  documentsCount: number = 0;
  stopper: boolean = false;

  @Input() showUpload: boolean = true;
  @Input() userEmail: string = "";
  @Input() getDocumentList: boolean = true;

  @ViewChild(DocumentUploadComponent) uploadChild;
  visible: boolean = false;

  constructor(
    private configService: ConfigService,
    private documentsListService: DocumentsListService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private location: Location,
    private changeDetector : ChangeDetectorRef,
    private userService: UserService,
    private loadingService: LoadingService,
    private usersManagementService: UsersManagementService,
    public router: Router
  ) {
      this.page = this.configService.documentsList(this.userService.language);
      this.page = this.page.default;
      this.sortList = this.page.sort_list;
      this.sortTopicList = this.page.sort_topic_list;
  }

  ngOnInit() {

  }

  ngAfterViewInit() { //Carga cuando la pantalla finalice su carga

    if (this.statusParamMap == "open" && this.uploadChild) { //Se usa para abrir directamente el Modal de subir documentos
      //this.uploadChild?.showDialog();
      this.location.replaceState("/documents");
      this.statusParamMap = null;
    }else if(this.statusParamMap == "topic" && this.uploadChild) { //Se usa para activar directamente la pestaña de topicos
      this.changeIndex(1);
      this.location.replaceState("/documents");
      this.statusParamMap = null;
    } else if(this.statusParamMap == "document" && this.uploadChild) { //Se usa para activar directamente la pestaña de documentos
      this.changeIndex(0);
      this.location.replaceState("/documents");
      this.statusParamMap = null;
    }

    if(this.getDocumentList){ //Se usa para validar en caso de que la pantalla este siendo reutilizada
      this.loadDocumentList();
      this.loadTopicList();
      this.changeDetector.detectChanges();
    }


  }

  loadList(){
    this.loadDocumentList();
    this.loadTopicList();
    this.changeDetector.detectChanges();
  }


  //Se usa para obten4er la lista de documentos
  loadDocumentList(){
    if(this.showLoader){
      this.loadingService.show();
    }
    this.documentsListService.GetDocumentList(this.userEmail.length == 0 ? "": this.userEmail).subscribe({
      next: (res) => {
        if(res){
          //Se hace una transformacion de las fechas para poder mostrarlas
          this.documentList = res.sort((a:any, b:any) => {
            let dateA = a.upload_date.split("/");
            let dateB = b.upload_date.split("/");
            let timeA = dateA[2].split(' ')[1].split(":");
            let timeB = dateB[2].split(' ')[1].split(":");
            return <any>new Date(+dateB[2].split(' ')[0], dateB[1] - 1, +dateB[0], timeB[0], timeB[1], timeB[2]) - <any>new Date(+dateA[2].split(' ')[0], dateA[1] - 1, +dateA[0], timeA[0], timeA[1], timeA[2])
          });
          this.documentsCount = res.length
          this.originalDocumentList = this.documentList;
        }
        this.loadingService.hide();
        //Se valida en caso de que la lista tenga documentos que noe sten procesados para intentar obtenerlos nuevamente cada 30 segundos
        this.originalDocumentList.forEach(document => {
          if((document.pinecone_process_status == 'PROCESSING' || document.pinecone_process_status == 'CREATED') && !this.stopper){
            this.showLoader = false;
            this.stopper = true;
            setTimeout(() => {this.stopper = false; this.loadDocumentList()}, 30000)
          }
        });
      },
      error: () => {
        this.loadingService.hide();
        const notification: ToastNotification = {
          title: this.page.Failed_load_documents.title,
          content: this.page.Failed_load_documents.content,
          success_status: false,
        };
        this.messageService.Notify(notification);
      }
    })
  }

  loadTopicList(): void { //obtiene la lista de topicos
    this.usersManagementService.GetClientTopic(this.userEmail.length == 0 ? "": this.userEmail).subscribe({
      next: (res: any) => {
        this.originalTopicList = res.sort((a,b) => a.topic_name > b.topic_name ? 1 : -1);
        this.originalTopicList = this.originalTopicList.filter(topic => topic.topic_status == 'ENABLED')
        this.topicList = this.originalTopicList;
      },
      error: (error) =>{

      }
    });
  }

  changeIndex(index: any){ //Cambie el indice de tabbar
    this.activeIndex = index
  }

  onPageChange(event: any) { //Se activa cuando se navegan entre paginas del listado
    this.first = event.first;
    this.rows = event.rows;
  }

  EditDocument(document: any){ //Activa el modal de editar documento
    this.uploadChild.editForm(document);
  }

  sortDocumentList() {
    switch (this.sortBy.code) {
      case "aliasAsc":
        this.documentList = this.documentList.sort((a: any, b: any) => a.alias.localeCompare(b.alias));
        break;
      case "aliasDesc":
        this.documentList = this.documentList.sort((a: any, b: any) => b.alias.localeCompare(a.alias));
        break;
      case "nameAsc":
        this.documentList = this.documentList.sort((a: any, b: any) => a.filename.localeCompare(b.filename));
        break;
      case "nameDesc":
        this.documentList = this.documentList.sort((a: any, b: any) => b.filename.localeCompare(a.filename));
        break;
      case "dateAsc":
        this.documentList = this.documentList.sort((a: any, b: any) =>
          this.parseUploadDate(a.upload_date) - this.parseUploadDate(b.upload_date)
        );
        break;
      case "dateDesc":
        this.documentList = this.documentList.sort((a: any, b: any) =>
          this.parseUploadDate(b.upload_date) - this.parseUploadDate(a.upload_date)
        );
        break;
      default:
        break;
    }
  }

  parseUploadDate(dateStr: string): number {
    const [day, month, yearTime] = dateStr.split('/');
    const [year, time] = yearTime.split(' ');
    const [hour, minute, second] = time.split(':');
    return new Date(+year, +month - 1, +day, +hour, +minute, +second).getTime();
  }

  searchDocument() {//Realiza la busqueda de documentos
      this.documentList = this.originalDocumentList.filter((document:any) =>
              document.alias.toLowerCase().includes(this.search.toLowerCase()) ||
              document.filename.toLowerCase().includes(this.search.toLowerCase())
      );
      this.first = 0;
  }

  sortTopicsList(){ //organiza la lista de topicos
    switch (this.sortByTopic.code) {
      case "nameAsc":
        this.topicList = this.topicList.sort((a:any, b:any) => a.topic_name.localeCompare(b.topic_name));
        break;
      case "nameDesc":
          this.topicList = this.topicList.sort((a:any, b:any) => b.topic_name.localeCompare(a.topic_name));
          break;
      default:
        break;
    }
  }

  searchTopics() { //Busca documentos en la lista
    this.topicList = this.originalTopicList.filter((topic:any) =>
                  topic.topic_name.toLowerCase().includes(this.searchTopic.toLowerCase())
    );
  }

  showDialog(){ //Activa el modal de subir documentos
    this.uploadChild.showDialog();
    this.visible = true;
  }

}
