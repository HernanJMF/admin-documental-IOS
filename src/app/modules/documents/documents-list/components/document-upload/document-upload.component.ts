import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentsListService } from 'src/app/core/services/documents-list/documents-list.service';
import { Observable, ReplaySubject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/services/users/user.service';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { LoadingService } from 'src/app/core/services/loading/loading-service.service';
import { FileHandle } from 'src/app/shared/directives/drap-drop/drag-drop.directive';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent {

  formGroup: FormGroup;
  isValid: boolean = false;
  visible: boolean = false;
  document: any;
  extensionLogo: any = {
    "jpeg": "../../../../assets/icons/jpg-icon.svg",
    "jpg": "../../../../assets/icons/jpg-icon.svg",
    "png": "../../../../assets/icons/png-icon.svg",
    "docx": "../../../../assets/icons/doc-icon.svg",
    "xlsx": "../../../../assets/icons/xls-icon.svg",
    "xls": "../../../../assets/icons/xls-icon.svg",
    "pdf": "../../../../assets/icons/pdf-icon.svg",
    "txt": "../../../../assets/icons/txt-icon.svg"
  };
  fileUploaded: boolean = false;
  showModal: boolean = false;
  editActive: boolean = false;
  topicActive: boolean = true;
  role: string = "";
  blobFile: any
  selectedFile: File | null = null;
  fileThumbnailSrc: string | null = null;
  body: any = {};
  documentTopic: any[] = [];

  @Input() page: any;
  @Input() TopicList: any[] = [];
  @Output() updateList = new EventEmitter();

  constructor(
    private documentsListService: DocumentsListService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private loadingService: LoadingService
  ){
    this.role = this.userService.role;
    this.resetForm();
  }

  ngOnInit() {

  }

  resetForm(){ //Inicializa formulario para subir documentos
    this.formGroup = this.formBuilder.group({
      alias: ["", [Validators.required,
                   Validators.minLength(3),
                   Validators.pattern(/^[^$%@=,;?¿¡!+|¨°¬<>]*$/),
                   Validators.maxLength(50),
                   Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/),
                   this.aliasNumericValidator,
                   this.customAliasValidator]],
      description: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(400)]],
      topic: [null, []],
      document: ["",Validators.required]
    });
    this.formGroup.controls['topic'].enable();
    this.isValid = false;
    this.formGroup.statusChanges.subscribe(status => {//Subscribe que se mantiene activo para validar boton
      this.isValid = (status == "VALID");
    });
  }

  showDialog() { //carga cada vez que se abre la pantalla
    this.resetForm(); // Restablecer el estado del formulario
    this.visible = true;
  }

  editForm(document: any) { //inicializa datos en caso de editar un documento
    this.document = document;
    this.visible = true;
    this.editActive = true;
    this.topicActive = document.topic == null ? false : true;

    this.documentTopic = [
      {
        "topic_name": document.topic,
        "topic_status": "ENABLED",
        "topic_id": ""
      }
    ]
    this.formGroup.controls['alias'].setValue(document.alias);
    this.formGroup.controls['description'].setValue(document.summary);
    this.formGroup.controls['topic'].setValue(this.documentTopic[0]);
    this.formGroup.controls['topic'].disable();
    this.formGroup.controls['document'].setValue(document.S3_directory);
  }

  closeDialog(){ //resetea los valores por defecto cuando se cierra el modal
    this.visible = false;
    this.editActive = false;
    this.cancelDocument();
    this.resetForm();
  }

  cancelDocument(){
    this.selectedFile = null;
    this.fileUploaded = false;
  }

  translateDocumentExtension(extension: string): string | undefined {
    // Convierte la extensión a minúsculas (por si acaso)
    const lowerCaseExtension = extension.toLowerCase();

    // Busca la URL del logotipo basada en la extensión
    const logoURL = this.extensionLogo[lowerCaseExtension];

    return logoURL;
  }

  //Obtiene el valor de la extension
  getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts[parts.length - 1].toLowerCase();
  }

  //Se usa para obtener los valores cuando son arrastrados
  filesDropped(files: FileHandle[]): void {
    this.onFileSelected(files[0].file, true)
  }

  //Metodo que registra los valores obtenidos al arrastrar un documento desde la pc o cargarlo con el boton
  async onFileSelected(event: any, dropped?: boolean) {
    if(dropped){ //si el documento es con drag and drop se settea asi
      this.selectedFile = event;

    }else{ // si el documento es cargado mediante la ventana se settea asi
      this.selectedFile = event.files[0];
    }
    this.formGroup.get('document').setValue(this.selectedFile.name)

    //Valida que el formato sea el correcto
    if (['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'docx', 'pdf', 'txt', 'JPG', 'JPEG', 'PNG'].includes(this.selectedFile.name.split('?')[0].split('.').pop()) && (this.selectedFile.size / (1024 * 1024)) <= 25) {
      const fileInfo = document.getElementById('fileInfo');
      const fileName = document.getElementById('fileName');
      const fileSize = document.getElementById('fileSize');
      const fileThumbnail = document.getElementById('fileThumbnail') as HTMLImageElement; // Indicar que es una imagen
      this.fileUploaded = true;

      if (fileInfo && fileName && fileSize && fileThumbnail) {
        // Mostrar nombre del archivo y tamaño
        fileName.innerText = `Nombre del Archivo: ${this.selectedFile.name}`;
        fileSize.innerText = `Tamaño del Archivo: ${this.formatFileSize(this.selectedFile.size)}`;


      }
      await this.onloadedReader(this.selectedFile).then(result => { // carga el documento como url
        this.blobFile = result;
      })
      this.blobFile = this.dataURLtoBlob(this.blobFile); //el documento cargado es convertido a blob
    }else if( !['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'docx', 'pdf', 'txt', 'JPG', 'JPEG', 'PNG'].includes(this.selectedFile.name.split('?')[0].split('.').pop())){
      //si el formato no es correcto notifica el error
      const notification: ToastNotification = {
        title: this.page.unsupported_extension.title,
        content: this.page.unsupported_extension.content,
        success_status: false,
      };
      this.messageService.Notify(notification);
    } else if((this.selectedFile.size / (1024 * 1024)) > 25){
      //Si las dimensiones no son las correctas notifica el error
      const notification: ToastNotification = {
        title: this.page.maximun_mb_limit.title,
        content: this.page.maximun_mb_limit.content,
        success_status: false,
      };
      this.messageService.Notify(notification);
    }

  }

  formatFileSize(size: number): string {// Cambia el formato del peso del documento
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  uploadButton(){// VAlida si se esta editando o agregando un boton
    if(this.editActive){
      this.editDocument();
    }else{
      this.uploadDocument();
    }
  }

  editDocument(){ //si se manda la peticion de un documento editado carga este metodo
    let body = {
      user_email: this.userService.email,
      document_id: this.document.document_id,
      alias: this.formGroup.controls['alias'].value,
      summary: this.formGroup.controls['description'].value
    }
    this.documentsListService.editDocumentUploaded(body).subscribe({
      next: () => {
        this.visible = false;
        this.editActive = false;
        this.updateList.emit();
        const notification: ToastNotification = {
          title: this.page.document_edited.title,
          content:this.page.document_edited.content,
          success_status: true,
        };
        this.messageService.Notify(notification);
        // Aquí puedes manejar la respuesta exitosa del servicio
      },
      error: () => {
        // Aquí puedes manejar errores si ocurren
        const notification: ToastNotification = {
          title: this.page.duplicated_alias_error.title,
          content: this.page.duplicated_alias_error.content,
          success_status: false,
        };
        this.messageService.Notify(notification);
      }
    });
  }

  uploadDocument() {//Si se crea un nuevo documento carga este metodo
    // Asigna el nombre del documento
    if( this.formGroup.controls['topic'].value == null){//Body en caso que no tenga topico
      this.body = {
        filename: this.selectedFile.name,
        user_email: this.userService.email,
        alias: this.formGroup.controls['alias'].value,
        summary: this.formGroup.controls['description'].value
      }
    }else{ //Body en caso que tenga topico
      this.body = {
        filename: this.selectedFile.name,
        user_email: this.userService.email,
        alias: this.formGroup.controls['alias'].value,
        topic: this.formGroup.controls['topic'].value.topic_name,
        topic_id: this.formGroup.controls['topic'].value.topic_id,
        summary: this.formGroup.controls['description'].value
      }
    }

    this.loadingService.show();
    this.isValid = true;
    // Llama a la función del servicio y suscríbete al observable resultante
    this.documentsListService.PostDocumentUpload(this.body).subscribe({ //Paso 1: Sube la información del documento y genera la url para subirlo
      next: (response) => {
        this.uploadAndPatchDocument(response)
        // Aquí puedes manejar la respuesta exitosa del servicio
      },
      error: (error) => {
        // Aquí puedes manejar errores si ocurren
        let notification: ToastNotification;
        if(error.error.type == "TypeError"){
          notification = {
            title: this.page.duplicated_alias_error.title,
            content: this.page.duplicated_alias_error.content,
            success_status: false,
          };
        }else{
          notification = {
            title: this.page.Unexpected_error.title,
            content: this.page.Unexpected_error.content,
            success_status: false,
          };
        }
        this.isValid = false;
        this.loadingService.hide();
        this.messageService.Notify(notification);
      }
    });
  }

  uploadAndPatchDocument(documentInfo: any) {
    // Realiza la subida del documento
    this.documentsListService.PutDocument(documentInfo.presigned_url, this.blobFile).subscribe({ //paso 2: usa la url generada y el documento para subir el documento a S3
      next: () => {
        // Verifica si la subida fue exitosa
          let pineconeBody = {
            s3_key : "documents/" + this.userService.email + "/" + this.body.filename ,
            vector_id: documentInfo.vector_id,
            document_id: documentInfo.document_id,
            user_email: this.userService.email,
            file_type: this.body.filename.split('?')[0].split('.').pop(),
            topic: this.body.topic,
          }

          // Llama al servicio para realizar el parcheo
          this.documentsListService.PostDocumentPinecone(pineconeBody).subscribe({ //Paso 3: carga el documento a pinecone
            next: () => {
              // Maneja la respuesta del PATCH si es necesario
              this.loadingService.hide();
              this.visible = false;
              this.selectedFile = null;
              this.resetForm();
              this.updateList.emit();
              const notification: ToastNotification = {
                title: this.page.document_uploaded.title,
                content:this.page.document_uploaded.content,
                success_status: true,
              };
              this.messageService.Notify(notification);
            },
            error: () => {
              // Maneja cualquier error que pueda ocurrir durante el PATCH
              this.loadingService.hide();
              this.isValid = false;
              const notification: ToastNotification = {
                title: this.page.Unexpected_error.title,
                content: this.page.Unexpected_error.content,
                success_status: false,
              };
              this.messageService.Notify(notification);
            }
          });
      },
      error: () => {
        // Maneja cualquier error que pueda ocurrir durante la subida
        this.loadingService.hide();
        this.isValid = false;
        const notification: ToastNotification = {
          title: this.page.Unexpected_error.title,
          content: this.page.Unexpected_error.content,
          success_status: false,
        };
        this.messageService.Notify(notification);
      }
    });
  }

  convertFile(file : File) : Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  //Convierte documento formato DATA URL en Blob
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

  //convierte un FILE en un DATA URL
  async onloadedReader(file: any){
    return new Promise(function(resolve, reject) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => { resolve(reader.result); }
      reader.onerror = error => reject(error);
    });
  }


  //Los metodos restantes se encargan de añadir validaciones a los campos del formulario

  public noWhitespaceValidator(control: FormGroup) {
    if (control.value && control.value.trim() === '') {
        return { 'whitespace': true };
    }
    return null;
  }

  public customAliasValidator(control: FormControl) {
    const aliasValue = control.value || '';
    // Utiliza una expresión regular para verificar si el alias contiene solo caracteres especiales
    if (/^[!@#$%^&*(),-.'?":{}|<>]+$/i.test(aliasValue)) {
      return { 'invalidAlias': true };
    }

    return null;
  }

  public aliasNumericValidator(control: FormControl) {
    const aliasValue = control.value || '';

    if (/^\d+$/.test(aliasValue)) {
      return { 'numericAlias': true };
    }

    return null;
  }


}
