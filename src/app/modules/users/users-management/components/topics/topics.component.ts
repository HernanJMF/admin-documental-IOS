import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { UsersManagementService } from 'src/app/core/services/users-management/users-management.service';
import { topicRequest } from 'src/app/shared/models/topics/topics-request';
import { topicStatusRequest } from 'src/app/shared/models/topics/update-topic-request';
import { ConfirmationService } from 'primeng/api';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { LoadingService } from 'src/app/core/services/loading/loading-service.service';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { Router } from '@angular/router';

export interface Topic {
  topic_name: string;
  topic_status: string;
  topic_id: string;
}
@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss'],
  providers: [ConfirmationService],
})
export class TopicsComponent implements OnInit {
  topic: any;
  topicClass: string = '';
  originalTopicsList: any = [];
  visible: boolean = false;
  showModal = false;
  newTopic = '';
  topics: any[] = [];
  activeIndex: number = 0;
  topicForm: FormGroup;
  newTopicControl: FormControl = new FormControl('');
  selectedTopicId: string | null = null;
  search: string = '';
  originalTopicsListEnable: Topic[] = [];
  originalTopicsListDisable: Topic[] = [];
  filteredTopicsEnable: Topic[] = [];
  filteredTopicsDisable: Topic[] = [];
  private topicToUpdate: Topic | null = null;
  isInputFocused: boolean = false;
  topicList: any = [];
  originalTopicList: any = [];
  TopicCount: number = 0;
  searchControl: FormControl = new FormControl('');
  shouldLoadTopics: boolean = true;
  @Input() page: any = '';
  @Input() topicsListEnable: Topic[] = [];
  @Input() topicsListDisable: Topic[] = [];
  @Output() topicListUpdated = new EventEmitter<any>();

  constructor(
    private configService: ConfigService,
    private fb: FormBuilder,
    private usersManagementService: UsersManagementService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private userService: UserService,
    private loadingService: LoadingService,
    private router: Router,

  ) {
    this.topic = this.configService.documentsList();
    this.topic = this.topic.default;
  }

  resetForm() {
    this.topicForm = this.fb.group({
      newTopic: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(40),
          Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/),
          this.noSpecialCharactersValidator,
        ],
      ],
    });
  }

  ngOnInit(): void {
    // Inicializa el FormGroup y vincula el control
    this.topicForm = this.fb.group({
      newTopic: this.newTopicControl,
    });

    this.searchControl.statusChanges.subscribe(() => {
      this.searchTopics();
    });
    this.resetForm();
  }

  addTopic(): void {
    if (this.topicForm.valid) {
      // Crear un objeto topicRequest
      const topicBody = new topicRequest(
        this.userService.email,
        this.topicForm.get('newTopic').value
      );

      // Llamar al servicio para agregar el nuevo topic
      this.loadingService.show();
      this.usersManagementService.PostNewTopics(topicBody).subscribe({
        next: () => {
          this.loadingService.hide();
          const notification: ToastNotification = {
            title: this.page.add_topic.title,
            content: this.page.add_topic.content,
            success_status: true,
          };

          // Mostrar la notificación de éxito usando tu servicio de notificaciones
          this.messageService.Notify(notification);

          // Limpiar el campo del nuevo tema después de agregarlo
          this.topicForm.get('newTopic').reset();
          this.topicListUpdated.emit();
        },
        error: (error) => {
          this.loadingService.hide();
          let notification: ToastNotification;
          if (error.error.message == 'Topic already exists') {
            notification = {
              title: this.page.duplicated_topic_error.title,
              content: this.page.duplicated_topic_error.content,
              success_status: false,
            };
          } else {
            notification = {
              title: 'Error',
              content: this.page.add_topic.content_error,
              success_status: false,
            };
          }

          // Mostrar la notificación de error usando tu servicio de notificaciones
          this.messageService.Notify(notification);
        },
      });
    }
  }

  changeIndex(index: any) {
    this.activeIndex = index;
  }

  /* loadTopicList(): void {
    this.usersManagementService.GetTopic().subscribe(
      (res: any) => {
        this.topicsListEnable = [];
        this.topicsListDisable = [];
        for (let topic of res) {
          if (topic.topic_status === 'ENABLED') {
            this.topicsListEnable.push(topic);
          } else {
            this.topicsListDisable.push(topic);
          }
        }

        // Inicializa las listas filtradas aquí
        this.filteredTopicsEnable = [...this.originalTopicsListEnable];
        this.filteredTopicsDisable = [...this.originalTopicsListDisable];
      }
    );
  } */

  updateTopicListEnable(updatedTopic: Topic): void {
    // Actualiza la lista de temas habilitados
    const index = this.topicsListEnable.findIndex(
      (topic) => topic.topic_id === updatedTopic.topic_id
    );

    if (index !== -1) {
      // Si el tema ya existe en la lista de habilitados, actualiza su estado
      this.topicsListEnable[index] = updatedTopic;
    } else {
      // Si el tema no existe en la lista de habilitados, agrégalo
      this.topicsListEnable.push(updatedTopic);
    }
    this.topicListUpdated.emit();
  }

  updateTopicListDisable(updatedTopic: Topic): void {
    // Actualiza la lista de temas deshabilitados
    const index = this.topicsListDisable.findIndex(
      (topic) => topic.topic_id === updatedTopic.topic_id
    );

    if (index !== -1) {
      // Si el tema ya existe en la lista de deshabilitados, actualiza su estado
      this.topicsListDisable[index] = updatedTopic;
    } else {
      // Si el tema no existe en la lista de deshabilitados, agrégalo
      this.topicsListDisable.push(updatedTopic);
    }
  }

  confirmChangeStatusTopic(topic: Topic) {
    // Crear un objeto topicStatusRequest con el correo y el ID del tema
    const topicStatusBody = new topicStatusRequest(
      this.userService.role == 'ADMIN'
        ? this.userService.email
        : this.userService.admin,
      topic.topic_id
    );

    this.confirmationService.confirm({
      message: this.page.message,

      accept: () => {
        // Si el usuario hace clic en "Aceptar", realiza la solicitud a la API
        this.usersManagementService.StatusTopics(topicStatusBody).subscribe({
          next: () => {
            // Actualizar el estado del tema en la lista adecuada
            if (topic.topic_status === 'ENABLED') {
              // Si estaba habilitado, cambia a deshabilitado y quita de la lista de habilitados
              topic.topic_status = 'DISABLED';
              const index = this.topicsListEnable.findIndex(
                (t) => t.topic_id === topic.topic_id
              );
              if (index !== -1) {
                this.topicsListEnable.splice(index, 1);
              }
              // Agrega a la lista de deshabilitados
              this.topicsListDisable.push(topic);
            } else {
              // Si estaba deshabilitado, cambia a habilitado y quita de la lista de deshabilitados
              topic.topic_status = 'ENABLED';
              const index = this.topicsListDisable.findIndex(
                (t) => t.topic_id === topic.topic_id
              );
              if (index !== -1) {
                this.topicsListDisable.splice(index, 1);
              }
              // Agrega a la lista de habilitados
              this.topicsListEnable.push(topic);
            }

            const notification: ToastNotification = {
              title: this.page.update_topic.title,
              content: this.page.update_topic.content,
              success_status: true,
            };

            // Mostrar la notificación de éxito usando tu servicio de notificaciones
            this.messageService.Notify(notification);
          },
          error: (err) => {
            const notification: ToastNotification = {
              title: 'Error',
              content: this.page.update_topic.content_error,
              success_status: false,
            };

            // Mostrar la notificación de error usando tu servicio de notificaciones
            this.messageService.Notify(notification);
          },
        });
      },
      reject: () => {
        this.topicListUpdated.emit();
      },
    });
  }

  searchTopics() {
    // Obtiene el valor actual del campo de búsqueda
    const searchText = this.searchControl.value.toLowerCase();

    if (searchText.trim() === '') {
      // Si el campo de búsqueda está vacío, restaura las listas originales
      this.topicListUpdated.emit();
    } else {
      // Filtra los temas basados en el texto de búsqueda
      this.topicsListEnable = this.topicsListEnable.filter((topic: Topic) =>
        topic.topic_name.toLowerCase().includes(searchText)
      );

      this.topicsListDisable = this.topicsListDisable.filter((topic: Topic) =>
        topic.topic_name.toLowerCase().includes(searchText)
      );
    }
  }

  public noWhitespaceValidator(control: FormControl) {
    if (control.value && control.value.trim() === '') {
      return { whitespace: true };
    }
    return null;
  }

  public noSpecialCharactersValidator(control: FormControl) {
    const value = control.value || '';
    if (!/[a-zA-Z]/.test(value)) {
      return { noSpecialCharacters: true };
    }
    return null;
  }

  topicNoSpaces() {
    let stringArr = this.topicForm.controls['newTopic'].value.split(/(\s+)/);
    if (stringArr[0] === '') {
      this.topicForm.controls['newTopic'].setValue('');
      for (let i = 2; i < stringArr.length; i++) {
        this.topicForm.controls['newTopic'].setValue(
          this.topicForm.controls['newTopic'].value + stringArr[i]
        );
      }
    }
  }

  topicNoSpecialChars() {
    let newValue = this.topicForm.controls['newTopic'].value;

    // Expresión regular para permitir solo letras, números, espacios
    newValue = newValue.replace(/^[^a-zA-Z0-9]+/, '');

    // Actualiza el valor del campo
    this.topicForm.controls['newTopic'].setValue(newValue);
  }

  closeModal() {
    this.visible = false;
  }
  enable() {
    this.topicForm.get('newTopic').reset();
  }
  showDialog() {
    this.visible = true;
  }

  refresh() {
    window.location.reload();
  }
}
