import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { map } from 'rxjs/internal/operators/map';
import { DocumentsListComponent } from '../../../documents-list/pages/documents-list.component';
import { ChatAnalyzerService } from 'src/app/core/services/chat-analyzer/chat-analyzer.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnChanges{

  visible: boolean = false;
  expand: boolean = true;

  isVisible: boolean = false;
  fileUrl: any = ""; //url del documento
  safeUrl: any = ""; //url segura del documento
  documentIframe: any;
  urlIframe: any;
  loadDocumentList: boolean = false;
  topicDocumentUrl: string = '';
  topicDocument: any;
  showPreview: boolean = true;
  countPreview: boolean = true;

  @Input() page: any = "";
  @Input() type: string = "";
  @Input() documentList: any[] = []; //lista de documentos
  @Input() topicDocumentList: any[] = []; //documentos de un topico
  @Input() topicValue: any; //en caso de ser un topico guarda su valor
  @Input() subDocument: string; //en caso de ser un topico guarda su valor
  @Input() document: any = {
    preview: "",
    alias: "",
    status: true,
    filename: "",
    extension: "",
    size: "",
    description: "",
    topic: "",
    date: ""
  }

  @Output() openTopicDocument = new EventEmitter<any>(); //evento que se activa cuando se abre el documento de un topico
  @Output() openTopicChat = new EventEmitter<any>(); //evento que se activa cuando se abre el topico estando en un documento del mismo

  @ViewChild(DocumentsListComponent) documentListChild;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private chatAnalyzerService: ChatAnalyzerService,
    private changeDetector : ChangeDetectorRef
  ){
  }

  ngOnChanges() { //Detecta los cambios en tiempo real
    //Se valida que ya la pantalla haya cargado para mostrar el documento
    if(this.countPreview){
      this.showPreview = this.type == 'document' ? true : false;
      this.countPreview = false
    }
    //Se activa cuando el documento esta listo para cargar
    if(this.document.extension){
      this.openFilePreview();
    }

    if(this.topicDocumentList.length > 0 && this.subDocument){ // se usa para recargar cuando el websocket pierde la conexion
      let auxDocument = this.topicDocumentList.find((document) => document.document_id == this.subDocument);
      if(auxDocument){
        this.subDocument = undefined
        this.openTopicDocumentPreview(auxDocument);
        this.chatTopicDocument();
      }
    }
  }

  showDialog() {
    if(!this.loadDocumentList){
      this.documentListChild.loadList();
      this.loadDocumentList = true; //se usa para que no recargue la lista cada vez que se abre
    }
    this.visible = true;
  }

  openDocument(documentId: string){ //abre un documento en otra ventana
    this.router.navigate(
      [`/chat-analyzer/document/${documentId}`]
    )
    .then(() => {
      window.location.reload();
    });
  }

  openTopicDocumentPreview(document: any){ //Abre el preview del documento de un topico
    this.showPreview = false;
    this.topicDocument = document
    this.topicDocumentUrl = 'https://prod-agrobot-chat2dox-main-bucket.s3.eu-west-1.amazonaws.com/' + (['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'].includes(document.extension) ? document.S3_directory : encodeURIComponent(document.S3_directory));
    this.openFilePreview();
    this.showPreview = true;
  }

  openTopic(){ //abre nuevamente un topico
    this.openTopicChat.emit();
  }

  async openFilePreview () { //Vuelve la url segura para cargarla con la api de google
    this.fileUrl = "";

    // Validación de las variables antes de construir la URL
    if (!this.topicDocumentUrl && (!this.document || !this.document.preview)) {
      console.error("No se puede generar la vista previa: falta la URL o el documento.");
      this.isVisible = false; // Ocultar la vista previa si no hay datos válidos
      return;
    }

    // Construir la URL dependiendo de la disponibilidad de las variables
    this.fileUrl = this.topicDocumentUrl?.length > 0
      ? `https://docs.google.com/gview?url=${this.topicDocumentUrl}&embedded=true`
      : `https://docs.google.com/gview?url=${this.document.preview}&embedded=true`;

    // Generar una URL segura para el iframe
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl);

    this.isVisible = true;
  }

  getImage(url: string) {
    return this.http
      .get(url, {
        responseType: 'arraybuffer',
      })
      .pipe(
        map((response) => {
          return new File([response], 'example.docx', {
            type: 'application/msword'
          });
        })
      );
  }

  async onloadedReader(file: any){
    return new Promise(function(resolve, reject) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => { resolve(reader.result); }
      reader.onerror = error => reject(error);
    });
  }

  dataURLtoBlob(dataurl: any) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  chatTopicDocument(){ //Carga el documento de un topico para conversar con el
    this.chatAnalyzerService.chatTopicDocument(this.topicDocument.document_id, this.topicDocument.doc_owner).subscribe({
      next: (res) => {
        this.openTopicDocument.emit(res);
      },
      error: () => {

      }
    })
  }





}
