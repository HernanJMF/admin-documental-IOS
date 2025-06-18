import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { map } from 'rxjs/internal/operators/map';
import { firstValueFrom } from 'rxjs';
import { DocumentsListComponent } from '../../../documents-list/pages/documents-list.component';
import { ChatAnalyzerService } from 'src/app/core/services/chat-analyzer/chat-analyzer.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnChanges, OnInit {

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
  isReloading: boolean = false;
  S3Url: string = 'https://prod-agrobot-chat2dox-main-bucket.s3.eu-west-1.amazonaws.com/';
  innerWidth: number = window.innerWidth;

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
    private changeDetector: ChangeDetectorRef
  ) {
    // Inicializar variables para evitar errores de sanitización
    this.fileUrl = "";
    this.safeUrl = null;
    this.isVisible = false;
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

  ngOnInit() {
    const selectedId = localStorage.getItem('selectedDocumentId');
    if (selectedId && this.topicDocumentList?.length) {
      const doc = this.topicDocumentList.find(d => d.document_id === selectedId);
      if (doc) {
        this.openTopicDocumentPreview(doc);
      }
    }

    // Listener para actualizar innerWidth en tiempo real
    window.addEventListener('resize', () => {
      this.innerWidth = window.innerWidth;
    });
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

  async openTopicDocumentPreview(document: any){
    this.showPreview = false;
    this.topicDocument = document;
    this.topicDocumentUrl = ""; // Limpiar URL anterior

    try {
      // Construir la URL original
      const originalUrl = this.S3Url + (['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'].includes(document.extension)
        ? document.S3_directory
        : encodeURIComponent(document.S3_directory));

      // Obtener el presigned URL del backend
      const response = await firstValueFrom(this.chatAnalyzerService.getPresignedUrl(originalUrl));

      if (response && response.presigned_url) {
        // Usar el presigned URL directamente
        this.topicDocumentUrl = response.presigned_url;
      } else {
        console.error("No se pudo obtener el presigned URL, usando URL original");
        this.topicDocumentUrl = originalUrl;
      }
    } catch (error) {
      console.error("Error al obtener el presigned URL:", error);
      // Fallback: usar la URL original si falla el presigned URL
      this.topicDocumentUrl = this.S3Url + (['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'].includes(document.extension)
        ? document.S3_directory
        : encodeURIComponent(document.S3_directory));
    }

    await this.openFilePreview();
    this.showPreview = true;
    this.chatTopicDocument();
  }

  openTopic(){ //abre nuevamente un topico
    this.openTopicChat.emit();
  }

  async openFilePreview() {
    // Limpiar variables al inicio
    this.fileUrl = "";
    this.safeUrl = null;
    this.isVisible = false;

    // Validación de las variables antes de construir la URL
    if (!this.topicDocumentUrl && (!this.document || !this.document.preview)) {
      console.error("No se puede generar la vista previa: falta la URL o el documento.");
      return;
    }

    try {
      let urlToUse: string;

      // Si ya tenemos topicDocumentUrl (viene de openTopicDocumentPreview), usarlo directamente
      if (this.topicDocumentUrl?.length > 0) {
        urlToUse = this.topicDocumentUrl;
      } else if (this.document && this.document.preview) {
        // Si es un documento regular, obtener el presigned URL
        const response = await firstValueFrom(this.chatAnalyzerService.getPresignedUrl(this.document.preview));

        if (response && response.presigned_url) {
          urlToUse = response.presigned_url;
        } else {
          console.error("No se pudo obtener el presigned URL");
          urlToUse = this.document.preview;
        }
      } else {
        console.error("No hay URL disponible para mostrar el documento");
        return;
      }

      // Validar que la URL no esté vacía
      if (!urlToUse || urlToUse.trim() === '') {
        console.error("URL vacía o inválida:", urlToUse);
        return;
      }

      // Construir la URL para Google Docs viewer
      this.fileUrl = `https://docs.google.com/gview?url=${encodeURIComponent(urlToUse)}&embedded=true`;

      // Generar una URL segura para el iframe
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl);

      // Solo mostrar si la sanitización fue exitosa
      if (this.safeUrl) {
        this.isVisible = true;
      }

    } catch (error) {
      console.error("Error al procesar la vista previa del documento:", error);
      // Fallback: usar la URL original si falla
      try {
        const fallbackUrl = this.topicDocumentUrl?.length > 0
          ? this.topicDocumentUrl
          : this.document.preview;

        if (fallbackUrl && fallbackUrl.trim() !== '') {
          this.fileUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fallbackUrl)}&embedded=true`;

          // Generar una URL segura para el iframe
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl);

          // Solo mostrar si la sanitización fue exitosa
          if (this.safeUrl) {
            this.isVisible = true;
          }
        }
      } catch (fallbackError) {
        console.error("Error en el fallback:", fallbackError);
        this.isVisible = false;
      }
    }
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

  // Método para recargar manualmente el documento
  async reloadDocument() {
    if (this.isReloading) {
      return; // Evitar múltiples recargas simultáneas
    }

    this.isReloading = true;

    try {
      // Limpiar estado anterior
      this.safeUrl = null;
      this.isVisible = false;
      this.fileUrl = "";

      // Forzar detección de cambios para mostrar el estado de loading
      this.changeDetector.detectChanges();

      // Esperar un poco para que el usuario vea que algo está pasando
      await new Promise(resolve => setTimeout(resolve, 500));

      // Recargar el documento
      if (this.type === 'topic' && this.topicDocument) {
        // Para documentos de tópico, volver a obtener el presigned URL
        await this.openTopicDocumentPreview(this.topicDocument);
      } else if (this.type === 'document' && this.document?.preview) {
        // Para documentos regulares, llamar directamente a openFilePreview
        await this.openFilePreview();
      }

    } catch (error) {
      console.error('Error al recargar el documento:', error);
    } finally {
      this.isReloading = false;
      this.changeDetector.detectChanges();
    }
  }

}
