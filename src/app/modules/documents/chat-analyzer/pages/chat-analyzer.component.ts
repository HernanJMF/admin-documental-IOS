import { Component, HostListener, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/core/services/users/user.service';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { UsersManagementService } from 'src/app/core/services/users-management/users-management.service';
import { DocumentsListService } from 'src/app/core/services/documents-list/documents-list.service';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { ConfirmationService } from 'primeng/api';
import { ChatComponent } from '../components/chat/chat.component';
import { ChatAnalyzerService } from 'src/app/core/services/chat-analyzer/chat-analyzer.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-chat-analyzer',
  templateUrl: './chat-analyzer.component.html',
  styleUrls: ['./chat-analyzer.component.scss'],
  providers: [ConfirmationService]
})
export class ChatAnalyzerComponent {

  page:any;
  documentIDParamMap: any = this.route.snapshot.paramMap.get('documentID'); //obtiene el valor del documento de la url
  typeParamMap: any = this.route.snapshot.paramMap.get('type'); //obtiene el valor del tipo (documento/Topico)
  subDocumentParamMap: any = this.route.snapshot.paramMap.get('subDocument'); //para abrir un documento particular de un topico
  emailParamMap: any = this.route.snapshot.paramMap.get('email'); //obtiene el email en caso que el administrador este viendo un usuario
  topicDocumentList: any[] = [];
  innerWidth: number;
  topic: any = {};
  topicList: any[] = []
  document: any = {}
  messages: Subject<any> = new Subject();
  selectedPanel!: number;
  panelOptions: any[] = [];
  documentList: any[] = [];
  topicChat: any;
  emptyTopicError: boolean = false;
  documentTopicSelected: boolean = false;

  @ViewChild(ChatComponent) ChatComponent;

  constructor(
    private configService: ConfigService,
    private chatAnalyzerService: ChatAnalyzerService,
    private route: ActivatedRoute,
    private userService: UserService,
    private usersManagementService: UsersManagementService,
    private documentsListService: DocumentsListService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private location: Location
  ){
    this.page = this.configService.chatAnalyzer(this.userService.language);
    this.page = this.page.default;
    this.loadDocumentList();
    this.loadTopicList();
    if (this.subDocumentParamMap) { //Se usa para abrir directamente el Modal de subir documentos
      this.location.replaceState("/chat-analyzer/topic/"+this.documentIDParamMap);
    }

    if(this.typeParamMap == 'topic'){ //Inicializa la variable para los casos de topico
      this.document = {
        preview: "",
        alias: "",
        status: "",
        filename: "",
        extension: "",
        size: "",
        description: "",
        topic: "",
        date: "",
        vector: "",
        documentID: ""
      }

    }

    //Se usa para obtener la informacion del documento
    this.chatAnalyzerService.GetDocument(this.documentIDParamMap, this.typeParamMap, this.emailParamMap).subscribe(
      (res) => {
        if(this.typeParamMap == 'document'){ //En caso de ser documento se ingresa la información
          this.document = {
              preview: 'https://preprod-agrobot-chat2dox-main-bucket.s3.eu-west-1.amazonaws.com/' + (['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'].includes(res.extension) ? res.S3_directory : encodeURIComponent(res.S3_directory)),
              alias: res.alias,
              status: res.has_chat,
              filename: res.filename,
              extension: res.extension,
              size: res.file_size,
              description: res.summary,
              topic: res.topic,
              date: res.upload_date,
              vector: res.vector_id,
              documentID: res.document_id
        }
        }else{ //En caso de ser topico se vacian los campos
          this.document = {
              preview: "",
              alias: "",
              status: "",
              filename: "",
              extension: "",
              size: "",
              description: "",
              topic: "",
              date: "",
              vector: "",
              documentID: ""
          };
          this.topicChat = res.chat;
        }
        this.messages.next(res.chat);
      },
      err => {
      }
    )

    this.innerWidth = window.innerWidth;

    //Calcula los valores del panel a mostrar
    if(this.innerWidth < 576 && this.typeParamMap == 'document'){
      this.panelOptions = [
        { name: 'Documents', value: 1 },
        { name: 'Chat', value: 2 },
        { name: 'Details', value: 3 }
      ];
      this.selectedPanel = 2;
    }else if(this.innerWidth < 576 && this.typeParamMap == 'topic'){
      this.panelOptions = [
        { name: 'Documents', value: 1 },
        { name: 'Chat', value: 2 }
      ];
      this.selectedPanel = 2;
    } else if(this.innerWidth >= 576 && this.typeParamMap == 'document') {
      this.panelOptions = [
        { name: 'Documents', value: 1 },
        { name: 'Details', value: 3 }
      ];
      this.selectedPanel = 3;
    } else{
      this.panelOptions = [
        { name: 'Documents', value: 1 },
        { name: 'Details', value: 3 }
      ];
      this.selectedPanel = 1;
    }

  }

  //Calcula cuando se redimensiona la pantalla los paneles a mostrar
  @HostListener('window:resize', ['$event'])
    onResize() {
        this.innerWidth = window.innerWidth;
        if(this.innerWidth < 576 && this.typeParamMap == 'document'){
          this.panelOptions = [
            { name: 'Documents', value: 1 },
            { name: 'Chat', value: 2 },
            { name: 'Details', value: 3 }
          ];
          this.selectedPanel = 2;
        }else if(this.innerWidth < 576 && this.typeParamMap == 'topic'){
          this.panelOptions = [
            { name: 'Documents', value: 1 },
            { name: 'Chat', value: 2 }
          ];
          this.selectedPanel = 2;
        }else if(this.innerWidth >= 576 && this.typeParamMap == 'document') {
          this.panelOptions = [
            { name: 'Documents', value: 1 },
            { name: 'Details', value: 3 }
          ];
          this.selectedPanel = 3;
        } else{
          this.panelOptions = [
            { name: 'Documents', value: 1 },
            { name: 'Details', value: 3 }
          ];
          this.selectedPanel = 1;
        }
  }

  async loadTopicList() { //Obtiene la lista de topicos del usuario
    await this.usersManagementService.GetTopic().subscribe(
      (res: any) => {
        for (let topic of res) {
          if (topic.topic_status === 'ENABLED') {
            this.topicList.push(topic);
          }
        }
        if(this.typeParamMap == 'topic'){ // si la conversacion es con un topico obtiene la lista de documentos del topico
          this.topic = this.topicList.find((topic: any) => topic.topic_id == this.documentIDParamMap);
          this.chatAnalyzerService.getTopicDocumentList(this.topic.topic_id).subscribe({
            next: (response) => {
              this.topicDocumentList = response;
              if(this.topicDocumentList.length == 0 && this.typeParamMap == 'topic'){
                this.noDocumentTopicErrorPopup()
              }
            },
            error: () => {
            }
          })
        }else{
          this.topic = {}
        }
      }
    );

  }

  loadDocumentList(){ //obtiene la lista de documentos recientes
    this.documentsListService.GetRecentDocument().subscribe({
      next: (res) => {
        this.documentList = res;
      },
      error: () => {
        const notification: ToastNotification = {
          title: this.page.loadDocumentList_error.title,
          content: this.page.loadDocumentList_error.content,
          success_status: false,
        };
        this.messageService.Notify(notification);
      }
    })
  }

  openDocument(document: any){ // abre un documento de un topico
    this.ChatComponent.changeDocument();
    this.documentTopicSelected = true;
    this.document = {
      preview: 'https://preprod-agrobot-chat2dox-main-bucket.s3.eu-west-1.amazonaws.com/' + (['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'].includes(document.extension) ? document.S3_directory : encodeURIComponent(document.S3_directory)),
      alias: document.alias,
      status: document.has_chat,
      filename: document.filename,
      extension: document.extension,
      size: document.file_size,
      description: document.summary,
      topic: document.topic,
      date: document.upload_date,
      vector: document.vector_id,
      documentID: document.document_id
    }

    this.messages.next(document.chat);
  }

  openTopic(){ //abre la conversacion con el topico de la lista
    this.ChatComponent.changeDocument();
    this.documentTopicSelected = false;
    this.document = {
      preview: "",
      alias: "",
      status: "",
      filename: "",
      extension: "",
      size: "",
      description: "",
      topic: "",
      date: "",
      vector: "",
      documentID: ""
  }

    this.messages.next(this.topicChat);
  }

  //Popup de error de topico sin documentos asociados
  noDocumentTopicErrorPopup() {
    this.emptyTopicError = true;
    this.confirmationService.confirm({
      message: this.page.chat.no_documents_error.content,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.emptyTopicError = false;
      },
      reject: () => {

      }
    });
  }
}

//be085495-45e3-11ee-a002-b1e9c29b0af3
//be08757b-45e3-11ee-97ce-b1e9c29b0af3
