import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { DocumentsListService } from 'src/app/core/services/documents-list/documents-list.service';
import { LoadingService } from 'src/app/core/services/loading/loading-service.service';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';

@Component({
  selector: 'app-document-card',
  templateUrl: './document-card.component.html',
  styleUrls: ['./document-card.component.scss'],
  providers: [ConfirmationService],
})
export class DocumentCardComponent {
  page: any;
  theme: string = '';
  themeStyles: string[] = ['', ''];
  extensionLogo: any = {
    jpeg: '../../../../assets/icons/jpg-icon.svg',
    jpg: '../../../../assets/icons/jpg-icon.svg',
    png: '../../../../assets/icons/png-icon.svg',
    docx: '../../../../assets/icons/doc-icon.svg',
    doc: '../../../../assets/icons/doc-icon.svg',
    xlsx: '../../../../assets/icons/xls-icon.svg',
    xls: '../../../../assets/icons/xls-icon.svg',
    pdf: '../../../../assets/icons/pdf-icon.svg',
    txt: '../../../../assets/icons/txt-icon.svg',
  };

  isMobile: boolean = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  @Input() document: any = {};
  @Input() showOptions: boolean = false;
  @Input() isAdmin: string = '';
  @Output() EditButton = new EventEmitter();
  @Output() DeleteButton = new EventEmitter();

  constructor(
    private configService: ConfigService,
    public router: Router,
    private documentsListService: DocumentsListService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    public userService: UserService,
    private loadingService: LoadingService
  ) {
    this.page = this.configService.documentCard(this.userService.language);
    this.page = this.page.default;
    this.theme = this.userService.theme;
  }

  openDocument(documentId: string) {
    if (this.showOptions) {
      this.router.navigate([`/chat-analyzer/document/${documentId}`]);
    } else if (this.isAdmin.length > 0) {
      this.router.navigate([
        `/chat-analyzer/document/${documentId}/user/${this.isAdmin}`,
      ]);
    } else {
      this.router
        .navigate([`/chat-analyzer/document/${documentId}`])
        .then(() => {
          window.location.reload();
        });
    }
  }

  openDocumentNewTab(documentId: string) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/chat-analyzer/document/${documentId}`])
    );
    window.open(url, '_blank');
  }

  confirmDelete() {
    this.confirmationService.confirm({
      message: this.page.confirm_body,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteDocument();
      },
      reject: () => {},
    });
  }

  deleteDocument() {
    let body;
    if (this.document.topic == null) {
      body = {
        user_email: this.userService.email,
        document_id: this.document.document_id,
        s3_key: this.document.S3_directory,
        vector_id: this.document.vector_id,
      };
    } else {
      body = {
        user_email: this.userService.email,
        document_id: this.document.document_id,
        s3_key: this.document.S3_directory,
        vector_id: this.document.vector_id,
        topic: this.document.topic,
      };
    }

    this.loadingService.show();
    this.documentsListService.deleteDocument(body).subscribe({
      next: () => {
        this.DeleteButton.emit();
        this.loadingService.hide();
        const notification: ToastNotification = {
          title: this.page.document_deleted.title,
          content: this.page.document_deleted.content,
          success_status: true,
        };
        this.messageService.Notify(notification);
      },
      error: () => {
        this.loadingService.hide();
        const notification: ToastNotification = {
          title: this.page.Unexpected_error.title,
          content: this.page.Unexpected_error.content,
          success_status: false,
        };
        this.messageService.Notify(notification);
      },
    });
  }

  validateLenght(text: string) {
    if (text.length > 66) {
      return text.slice(0, 70) + '...';
    } else {
      return text;
    }
  }

  translateDocumentExtension(extension: string): string | undefined {
    // Convierte la extensión a minúsculas (por si acaso)
    const lowerCaseExtension = extension.toLowerCase();

    // Busca la URL del logotipo basada en la extensión
    const logoURL = this.extensionLogo[lowerCaseExtension];

    return logoURL;
  }
}
