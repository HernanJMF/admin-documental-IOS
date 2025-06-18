import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ScrollPanel } from 'primeng/scrollpanel';
import { Subject, firstValueFrom } from 'rxjs';
import { UserService } from 'src/app/core/services/users/user.service';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { ClipboardService } from 'ngx-clipboard';
import { LoadingService } from 'src/app/core/services/loading/loading-service.service';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { DocumentsListComponent } from '../../../documents-list/pages/documents-list.component';
import { ChatAnalyzerService } from 'src/app/core/services/chat-analyzer/chat-analyzer.service';
import { DatePipe } from '@angular/common';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  providers: [ConfirmationService, DatePipe]
})
export class ChatComponent implements OnInit, OnChanges {

  shareFormGroup: FormGroup;
  chatMessage: string = "";
  fileUrl: any = ""; //url del documento con el que se esta conversando
  visible: boolean = false; //se usa para abrir o cerrar el modal de compartir un mensaje
  documentListVisible: boolean = false; //se usa para abrir o cerrar el modal de la lista de documentos
  documentViewerVisible: boolean = false; //se usa para abrir o cerrar el modal del visor de documentos
  documentViewerUrl: any = ""; //URL segura para el iframe del visor
  isDocumentLoading: boolean = false; //indica si el documento se está cargando en el modal
  isValid: boolean;
  lastMessage: string = "";
  scrollLarge: number = 10;
  messages: any[] = []; //Lista de mensajes de la conversación
  summary: string = ""; //contiene el resumen
  isSummaryActive: boolean = false; //se usa para saber que se debe seguir generando el resumen
  generateSummary: boolean = true; // variable que se utiliza para validar si ya se ha generado previamente un resumen en esta misma pantalla
  showPrompts: boolean = false; // si esta variable se activa es por que se generaron prompts sugeridos para el usuario
  promptsList: any[] = [];
  shareDate: any;
  isWaitingForResponse: boolean = false;
  firtLetter: string = ""; //se usa para obtener la primera letra del nombre del usuario
  currentMessage: string = "";
  previousMessage: string = "";
  selectedLanguage: any = "";
  userRole: string = "";
  visibleDetails: boolean = false; //Se usa para abrir la seccion de detalles del chat
  isVisible: boolean = false;
  showTopicDocument: boolean = false;
  LanguageList = [
    { name: 'En', code: 'english' },
    { name: 'Es', code: 'spanish' }
  ]
  copySelected: boolean[] = [false,false,false]
  loadDocumentList: boolean = false; //se usa para que no recargue la lista cada vez que se abre
  deleteMessage: boolean = true; //valida que mensaje se debe mostrar en el overlay de alerta
  private originalChatMessage: string = "";
  isImagePreview: boolean = false;

  @Input() page: any = "";
  @Input() documentList: any[] = [];
  @Input() innerWidth: number = 0;
  @Input() document: any = {};
  @Input() type: string = "";
  @Input() topicValue: any; //valores del topico en caso de serlo
  @Input() userEmail: string = ""; //Si esta variable posee datos es por que el admin esta visualizando el chat de su usuario
  @Input() topicDocumentList: any[] = [];
  @Input() changingMessages: Subject<boolean>;
  @Input() documentTopicSelected: boolean = false;  //se usa para validar si estamos en el documento de un topico
  @Input() language: string = "spanish";

  @Output() openTopicDocument = new EventEmitter<any>();
  @Output() openTopicChat = new EventEmitter<any>();

  @ViewChild('sp') scrollPanel: ScrollPanel; //se usa para actualizar el scroll
  @ViewChild(DocumentsListComponent) documentListChild;
  @ViewChild('chatInput', {static: false}) inputEl: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private chatAnalyzerService: ChatAnalyzerService,
    private changeDetector : ChangeDetectorRef,
    public userService: UserService,
    private messageService: MessageService,
    private loadingService: LoadingService,
    private confirmationService: ConfirmationService,
    private _clipboardService: ClipboardService,
    private router: Router,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer

  ){
    this.userRole = userService.role;
    this.firtLetter = this.userService.firstName.slice(0,1);
    this.selectedLanguage = this.LanguageList.find((language: any) => language.name.slice(0,2).toLowerCase() == this.userService.language.toLowerCase());
    this.resetShareForm()

    /*El subscribe de message es la conexion activa con el websocket y no se cerrara a menos que se cierre la pestaña,
    aqui se generan todas las validaciones y peticiones de las respuestas generadas por el back con IA y envia activamente las preguntas del usuario*/
    this.chatAnalyzerService.messages.subscribe({
      next: (msg: any) => {
        if (this.isSummaryActive) {
          this.document.status = 'true';
          if (msg && msg.message != undefined) {
            this.summary = this.summary + msg.message;
            this.isWaitingForResponse = true;
            this.chatMessage = this.language === 'english' ? "Generating answer..." : "Generando respuesta...";


          }
        } else {
          if (msg && msg.message != undefined) {

            this.lastMessage = this.lastMessage + msg.message;

          }
          this.messages[this.messages.length - 1].message = this.lastMessage;
        }

        this.changeDetector.detectChanges();
        if (this.scrollPanel) {
          this.scrollPanel.refresh();
          this.scrollPanel.scrollTop(10000000);
        }

        if (msg.action == 'stop_sequence_2' || msg.action == 'error') {
          this.lastMessage = "";
          if (this.isSummaryActive) {
            this.getPromptsList();
          }
          this.isSummaryActive = false;
          this.document.status = 'true';
          this.isWaitingForResponse = false; // ✅ Desbloquear input solo cuando la respuesta terminó
          this.chatMessage = ""; // ✅ Limpiar el input
          this.changeDetector.detectChanges();
          if (this.scrollPanel) {
            this.scrollPanel.refresh();
            this.scrollPanel.scrollTop(10000000);
          }
        }
      },
      error: (err) => {
        console.error("❌ Error en el WebSocket:", err);
        this.isWaitingForResponse = false; // ✅ Desbloquear input en caso de error
        this.chatMessage = ""; // ✅ Limpiar input en caso de error
        this.changeDetector.detectChanges();
        if (this.scrollPanel) {
          this.scrollPanel.refresh();
          this.scrollPanel.scrollTop(10000000);
        }
      },
      complete: () => {
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
        if (!isFirefox) {
          if (this.type == "topic" && this.documentTopicSelected) {
            this.router.navigate([`/chat-analyzer/topic/${this.topicValue.topic_id}/${this.document.documentID}`]);
          } else {
            window.location.reload();
          }
        }
      }
    });

  }

  //en el ngonInit se aplica la deteccion de cambios para detectar correctamente el espacio disponible en el scroll
  async ngOnInit(): Promise<void> {
    this.changeDetector.detectChanges();
    if (this.scrollPanel) {
      this.scrollPanel.refresh();
      this.scrollPanel.scrollTop(10000000);
    }
    this.changingMessages.subscribe((v:any) => { //obtiene las respuestas de conversaciones anteriores con el documento
      this.messages = v;
      this.changeDetector.detectChanges();
      if (this.scrollPanel) {
        this.scrollPanel.refresh();
        this.scrollPanel.scrollTop(10000000);
      }
    });

    // Inicializar presigned URL si el documento ya está cargado
    if (this.document && this.document.preview) {
      await this.openFilePreview();
    }

  }

  //se activa cada vez que detecta cambios del resto de componentes
  async ngOnChanges(): Promise<void> {
    // Verificamos si el observable 'changingMessages' está definido para evitar errores.
    if (this.changingMessages) {
      // Nos suscribimos al observable para obtener mensajes actualizados.
      this.changingMessages.subscribe((v: any) => {
        this.messages = v; // Actualizamos la lista de mensajes con los nuevos datos.
        this.changeDetector.detectChanges(); // Forzamos la detección de cambios en Angular.

        // Validamos que 'scrollPanel' esté definido antes de usarlo.
        if (this.scrollPanel) {
          this.scrollPanel.refresh(); // Refrescamos el estado del scroll.
          this.scrollPanel.scrollTop(10000000); // Movemos el scroll al final.
        }
      });
    }

    // Verificamos si 'this.document' y 'this.document.status' están definidos.
    if (this.document && this.document.status !== undefined) {
      // Evaluamos si 'status' es un string o lo convertimos a string.
      let documentStatus = typeof this.document.status === "string"
        ? this.document.status
        : this.document.status?.toString();

      // Si el documento no tiene resumen generado ('false') y es elegible para generar uno.
      if (documentStatus === 'false' && this.generateSummary) {
        this.generateSummary = false; // Evitamos que se genere más de un resumen.
        this.getSummary(); // Llamamos al método para generar el resumen.
      }
    }

    // Verificamos si 'this.document.extension' está definido antes de usarlo.
    if (this.document && this.document.extension) {
      // Abrimos la vista previa del documento si la extensión está disponible.
      await this.openFilePreview();
      this.isVisible = true; // Marcamos la vista previa como visible.
    }

    // También ejecutar si el documento cambia y tiene preview
    if (this.document && this.document.preview && !this.fileUrl) {
      await this.openFilePreview();
    }
  }

  //inicializa el formulario de compartir
  resetShareForm(){
    this.shareFormGroup = this.formBuilder.group({
      email: ["", [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
      message: ["", ],
    });

    this.shareFormGroup.statusChanges.subscribe(status => {
      this.isValid = status == "VALID" ? true : false;
    });
  }

  //abre el modal de compartir una pregunta
  showDialog(message: any, index: number) {
    this.resetShareForm();
    // Obtiene el mensaje anterior (pregunta) y el mensaje actual (respuesta)
    this.previousMessage = this.messages[index - 1]?.message || '';
    this.currentMessage = message || '';
    this.visible = true;
  }

  //activa o desactiva el apartado de detalles del chat para mostrar la informacion del documento
  showDetails(value: boolean){
    this.visibleDetails = value;
    if(!value){
      this.changeDetector.detectChanges();
      if (this.scrollPanel) {
        this.scrollPanel.refresh();
        this.scrollPanel.scrollTop(10000000000000000000000);
      }
    }
  }

  //en este metodo se envia la pregunta realizada por el usuario al backend
  sendMessage() {
    // Para poder enviar la pregunta el usuario debe poseer un estatus válido y adicionalmente ser un tópico con documentos o un documento individual
    if(((this.type == 'topic' ? this.topicDocumentList.length : 1) > 0)) {

      this.isWaitingForResponse = true; // Bloquear el input
      this.changeDetector.detectChanges();

      let chat_history: any[] = this.messages.slice(-6);
      let message: any = {};

      // Si la pregunta es a un tópico y no posee vector, se envía este body al websocket
      if (this.type == 'topic' && this.document.vector == 0) {
        message = {
          action: "sendMessage",
          message: this.chatMessage,
          document_id: this.topicValue.topic_id,
          language: this.selectedLanguage.code,
          topic: this.topicValue.topic_name,
          email: this.userService.email,
          summary: false,
          chat_history: chat_history,
          admin: this.userService.admin
        };
      }
      // Si la pregunta es a un documento que no posee tópico asignado, se envía este body al websocket
      else if (this.type == 'document' && this.document.topic == null) {
        message = {
          action: "sendMessage",
          message: this.chatMessage,
          language: this.selectedLanguage.code,
          document_id: this.document.documentID,
          vector_id: this.document.vector,
          email: this.userService.email,
          summary: false,
          chat_history: chat_history,
          admin: this.userService.admin
        };
      }
      // Si la pregunta es a un documento de un tópico asignado o en su defecto es el documento de una conversación con tópico, se envía este body
      else if ((this.type == 'document' && this.document.topic != null) || (this.type == 'topic' && this.document.vector.length > 0)) {
        message = {
          action: "sendMessage",
          message: this.chatMessage,
          language: this.selectedLanguage.code,
          document_id: this.document.documentID,
          vector_id: this.document.vector,
          email: this.userService.email,
          summary: false,
          topic: this.document.topic,
          chat_history: chat_history,
          admin: this.userService.admin
        };
      }

      // Estos métodos agregan mensajes a la funcionalidad del chat y en base a sus variables el diseño cambia
      var now_utc = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS', "UTC");
      this.messages.push({
        message: this.chatMessage,
        talker: 'HUMAN',
        interaction_date: now_utc,
        animation: false,
      });
      this.messages.push({
        message: '...',
        talker: 'AI',
        interaction_date: now_utc,
        animation: true
      });


      this.chatMessage = this.language === 'english' ? "Generating answer..." : "Generando respuesta...";
      this.changeDetector.detectChanges();
      if (this.scrollPanel) {
        this.scrollPanel.refresh();
        this.scrollPanel.scrollTop(10000000);
      }


      // Se envía la información de la pregunta al backend

      this.chatAnalyzerService.messages.next(message);

      // Simular la recepción de la respuesta para habilitar nuevamente el input
      setTimeout(() => {
        // Aquí va el código que maneja la respuesta del backend
      }, 3000); // Simulando un retraso de 3 segundos en la respuesta
    }
  }

  //metodo que genera el resumen
  getSummary(){
    this.isSummaryActive = true;
    this.isWaitingForResponse = true;
    this.changeDetector.detectChanges();

    let message: any = {};

    //en caso de que sea un documento sin topico se envia este body
    if(this.type == 'document' && this.document.topic == null){
      message = {
        action: "sendMessage",
        message: "",
        language: this.selectedLanguage.code,
        document_id: this.document.documentID,
        vector_id: this.document.vector,
        email: this.userService.email,
        summary: "true",
        admin: this.userService.admin
      }

    }
    //en caso de que sea un documento con topico se envia este body
    else if(this.type == 'document' && this.document.topic != null){
      message = {
        action: "sendMessage",
        message: "",
        language: this.selectedLanguage.code,
        document_id: this.document.documentID,
        vector_id: this.document.vector,
        email: this.userService.email,
        summary: "true",
        topic: this.document.topic,
        admin: this.userService.admin
      }
    }else{ // caso para documento de un topico
      message = {
        action: "sendMessage",
        message: "",
        language: this.selectedLanguage.code,
        document_id: this.document.documentID,
        vector_id: this.document.vector,
        email: this.userService.email,
        summary: "true",
        topic: this.document.topic,
        admin: this.userService.admin
      }
    }
    this.isWaitingForResponse = false; // ✅ Desbloquear input en caso de error
    this.chatMessage = ""; // ✅ Limpiar input en caso de error
    this.changeDetector.detectChanges();
    setTimeout(() => this.chatAnalyzerService.messages.next(message), 1000) // se utiliza un timeout ya que la respuesta no es inmediata

  }

  //metodo que genera la lista de prompts
  getPromptsList(){
    this.isWaitingForResponse = true;
    this.changeDetector.detectChanges();

    let body = {
      "count": "3",
      "summary": this.summary.replace(/(\r\n|\n|\r)/gm, "")
    }

    this.chatAnalyzerService.getPromptsList(body).subscribe({
      next : (res) => {
        this.promptsList = res
        this.showPrompts = true; // se activa para mostrar la lista de prompts
        this.changeDetector.detectChanges();
        if (this.scrollPanel) {
          this.scrollPanel.refresh();
          this.scrollPanel.scrollTop(10000000);
        }

      },
      error: err => {
      }
    })
  }

  //Copia la pregunta y respuesta al portapapeles
  //Copia la pregunta y respuesta al portapapeles
  copyQuestionToClipboard(message: string, index: number) {
    const previousMessage = this.messages[index - 1]?.message || '';
    const currentMessage = message || '';
    const references = this.messages[index]?.references || [];

    // Contenido en HTML
    let html = `
      <div>
        <strong>Pregunta:</strong>
        <p>${previousMessage}</p>
        <strong>Respuesta:</strong>
        <div>${this.formatHtmlTables(currentMessage)}</div>
    `;

    if (references.length > 0) {
      html += `<div><strong>Más información:</strong><ul>`;
      references.forEach((ref: any, idx: number) => {
        html += `<li>${idx + 1}. Documento: ${ref.document_name}, Página(s): ${ref.pages.join(', ')}</li>`;
      });
      html += `</ul></div>`;
    }

    html += '</div>';

    // También generamos versión texto por compatibilidad
    let text = `${previousMessage}\n\n${message}`;
    if (references.length > 0) {
      text += `\n\nMás información:\n`;
      references.forEach((ref: any, idx: number) => {
        text += `${idx + 1}. Documento: ${ref.document}, Página(s): ${ref.pages.join(', ')}\n`;
      });
    }

    // HTML y texto al portapapeles
    const blobHtml = new Blob([html], { type: 'text/html' });
    const blobText = new Blob([text], { type: 'text/plain' });

    const data = [new ClipboardItem({
      'text/html': blobHtml,
      'text/plain': blobText
    })];

    navigator.clipboard.write(data).then(() => {
      const notification: ToastNotification = {
        title: this.language == 'english'
          ? 'The answer and its references have been copied to the clipboard'
          : 'La respuesta y sus referencias han sido copiadas al portapapeles',
        content: '',
        success_status: true,
      };
      this.messageService.Notify(notification);
    }).catch(err => {
      console.error('Clipboard error:', err);
      // fallback en texto plano si falla
      this._clipboardService.copy(text);
    });
  }

  formatHtmlTables(text: string): string {
    const lines = text.split('\n');
    let result = '';
    let tableBlock: string[] = [];
    let insideTable = false;

    const flushTable = () => {
      if (tableBlock.length < 2) return tableBlock.join('\n'); // no es una tabla válida
      const headers = tableBlock[0].split('|').map(h => h.trim()).filter(Boolean);
      const body = tableBlock.slice(2); // saltamos separador

      let html = `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;margin-top:10px;">`;
      html += `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;

      body.forEach(row => {
        const cells = row.split('|').map(c => c.trim()).filter(Boolean);
        html += `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
      });

      html += `</tbody></table>`;
      return html;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('|') && line.endsWith('|')) {
        if (!insideTable) {
          insideTable = true;
          tableBlock = [];
        }
        tableBlock.push(line);
      } else {
        if (insideTable) {
          result += flushTable();
          tableBlock = [];
          insideTable = false;
        }

        if (line === '---') {
          result += '<hr>';
        } else {
          result += `<p>${line}</p>`;
        }
      }
    }

    // Si terminó con una tabla
    if (insideTable && tableBlock.length > 0) {
      result += flushTable();
    }

    return result;
  }

  formatMessage(message: string): string {
    if (!message) return "";

    // Eliminar espacios excesivos entre párrafos y ajustar saltos de línea
    let cleanedMessage = message.replace(/\n\s*\n/g, "\n\n").trim();

    // Convertir el mensaje a HTML usando marked
    let html = marked.parse(cleanedMessage) as string; // ✅ Forzar como string si es seguro

    // Sanitizar el HTML antes de devolverlo
    return DOMPurify.sanitize(html);
  }

  //Metodo que realiza el llamado a la peticion para compartir una pregunta
  shareQuestion(){
    //por alguna razon los mensajes estan llegando invertidos (Respuesta primero y luego pregunta)
    let body = {
      "question": this.currentMessage,
      "answer": this.previousMessage,
      "send_to": this.shareFormGroup.controls['email'].value,
      "message": this.shareFormGroup.controls['message'].value,
      "topic_name": this.topicValue.topic_name,
      "document_name": this.document.alias,
    }
    this.loadingService.show();
    this.chatAnalyzerService.shareQuestions(body).subscribe({
      next: () => {
        this.visible = false;
        this.resetShareForm();
        this.loadingService.hide();
        const notification: ToastNotification = {
          title: this.page.shareQuestion.title,
          content: '',
          success_status: true,
        };
        this.messageService.Notify(notification);
      },
      error: () => {
        this.loadingService.hide();
      }
    })
  }

  //DETAILS LOGIC
  //esta seccion de detalles del chat (la que se activa al tocar el nombre del bot en la barra azul)

  //inicializa el valor del preview con presigned URL
  async openFilePreview() {
    if (!this.document || !this.document.preview) {
      console.error("Documento no disponible o no inicializado.");
      return;
    }

    try {
      // Obtener el presigned URL del backend
      const response = await firstValueFrom(this.chatAnalyzerService.getPresignedUrl(this.document.preview));
      
      if (response && response.presigned_url) {
        // Usar el presigned URL para el enlace directo
        this.fileUrl = response.presigned_url;
      } else {
        console.error("No se pudo obtener el presigned URL, usando URL original");
        this.fileUrl = this.document.preview;
      }
    } catch (error) {
      console.error("Error al obtener el presigned URL:", error);
      // Fallback: usar la URL original si falla el presigned URL
      this.fileUrl = this.document.preview;
    }

    this.isVisible = true;
  }

  //activa el modal de vaciar chat
  confirmDelete() {
    this.deleteMessage = true;
    this.confirmationService.confirm({
      message: this.page.confirm_body,
      icon: 'pi pi-exclamation-triangle',
      accept: () => { // si se le da al boton de aceptar llama al metodo de vaciar chat
          this.deleteDocument();
      },
      reject: () => {

      }
    });
  }

  //metodo que llama a la peticion del vaciado del chat
  deleteDocument(){
    this.loadingService.show();
    this.chatAnalyzerService.deleteChat(this.type == "topic" ? this.documentTopicSelected ? this.document.documentID : this.topicValue.topic_id : this.document.documentID).subscribe({
      next: () => {
        window.location.reload();
        this.loadingService.hide();
      },
      error: (err) => {
        this.loadingService.hide();
      }
    })
  }

  showDocumentDialog() {
    this.visible = true;
  }

  //al seleccionar un documento de la lista de recientes se abrira una nueva pestaña
  openDocument(documentId: string){
    this.router.navigate(
      [`/chat-analyzer/document/${documentId}`]
    )
    .then(() => {
      window.location.reload();
    });
  }

  //valida el tamaño del largo de la descripcion del documento
  validateLenght(text: string){
    if(text.length>66){
      return text.slice(0,70) + "..."
    }else{
      return text
    }
  }

  //valida el tamaño del largo del titulo del documento
  validateTitleLenght(height: number){

    if(height <= 48){
      return this.type == 'topic' ? this.topicValue.topic_name : this.document.alias
    }else{
      return this.type == 'topic' ? this.topicValue.topic_name.slice(0,40) + "..." : this.document.alias.slice(0,40) + "..."
    }
  }

  formatDate(date: any){
    let dateA = date.split("-");
    let timeA = dateA[2].split(' ')[1].split(":");
    return <any>new Date(Date.UTC(dateA[0], dateA[1],dateA[2].split(' ')[0], timeA[0], timeA[1], timeA[2] ))
  }

  //este metodo copia y pega la informacion del prompt generado en el chat
  copyPrompt(prompt: string, index: number){
    this.copySelected = [false,false,false]
    this.copySelected[index] = true;
    this.chatMessage = prompt;
  }

  //abre el modal de documentos para abrir una conversacion diferente
  showDocumentList() {
    if(!this.loadDocumentList){
      this.documentListChild.loadList();
      this.loadDocumentList = true; //se usa para que no recargue la lista cada vez que se abre
    }
    this.documentListVisible = true;
  }

  //se usa para reiniciarlizar las interacciones del input y no ocurran errores de interaccion
  onKeydown(event){
    event.preventDefault();
  }

  //metodo utilizado para reiniciar las variables al seleccionar un nuevo documento en la conversacion con un topico
  changeDocument(){
    this.summary = "";
    this.showPrompts = false;
    this.generateSummary = true;
  }

  //abre una conversacion con el documento de un topico
  async chatTopicDocument(document: any){
    this.chatAnalyzerService.chatTopicDocument(document.document_id, document.doc_owner).subscribe({
      next: async (res) => {
        this.visibleDetails = false;
        this.openTopicDocument.emit(res);
        await this.openFilePreview();
      },
      error: () => {

      }
    })
  }

  //abre la conversacion con el topico
  openTopic(){
    this.visibleDetails = false;
    this.openTopicChat.emit();
  }

  openTopicDocumentHandler(event: any) {
    this.openTopicDocument.emit(event);
  }

  openTopicChatHandler() {
    this.openTopicChat.emit();
  }

  // Métodos para el modal del visor de documentos
  async openDocumentViewer() {
    if (!this.document || !this.document.preview) {
      console.error('Documento no disponible para mostrar en el visor');
      return;
    }

    this.isDocumentLoading = true;
    this.documentViewerVisible = true;
    this.isImagePreview = false;

    try {
      // Detectar si es imagen
      if (this.isImageFile(this.document.extension)) {
        // Mostrar la imagen directamente
        const response = await firstValueFrom(this.chatAnalyzerService.getPresignedUrl(this.document.preview));
        this.documentViewerUrl = response?.presigned_url || this.document.preview;
        this.isImagePreview = true;
      } else {
        // Obtener el presigned URL del backend
        const response = await firstValueFrom(this.chatAnalyzerService.getPresignedUrl(this.document.preview));
        let urlToUse: string;
        if (response && response.presigned_url) {
          urlToUse = response.presigned_url;
        } else {
          console.error('No se pudo obtener el presigned URL, usando URL original');
          urlToUse = this.document.preview;
        }
        // Construir la URL para Google Docs viewer
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(urlToUse)}&embedded=true`;
        // Generar una URL segura para el iframe
        this.documentViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
        this.isImagePreview = false;
      }
    } catch (error) {
      console.error('Error al obtener el presigned URL para el visor:', error);
      // Fallback: usar la URL original si falla el presigned URL
      try {
        if (this.isImageFile(this.document.extension)) {
          this.documentViewerUrl = this.document.preview;
          this.isImagePreview = true;
        } else {
          const fallbackViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(this.document.preview)}&embedded=true`;
          this.documentViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fallbackViewerUrl);
          this.isImagePreview = false;
        }
      } catch (fallbackError) {
        console.error('Error en el fallback del visor:', fallbackError);
      }
    } finally {
      this.isDocumentLoading = false;
    }
  }

  async reloadDocumentViewer() {
    if (this.isDocumentLoading) {
      return; // Evitar múltiples recargas simultáneas
    }
    
    this.isDocumentLoading = true;
    
    try {
      // Limpiar URL anterior
      this.documentViewerUrl = null;
      
      // Forzar detección de cambios para mostrar el estado de loading
      this.changeDetector.detectChanges();
      
      // Esperar un poco para que el usuario vea que algo está pasando
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recargar el documento
      await this.openDocumentViewer();
      
    } catch (error) {
      console.error('Error al recargar el documento en el visor:', error);
    } finally {
      this.isDocumentLoading = false;
      this.changeDetector.detectChanges();
    }
  }

  closeDocumentViewer() {
    this.documentViewerVisible = false;
    this.documentViewerUrl = null;
    this.isDocumentLoading = false;
  }

  isImageFile(extension: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes((extension || '').toLowerCase());
  }

}
