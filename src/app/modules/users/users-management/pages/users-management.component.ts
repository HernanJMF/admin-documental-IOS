import {
  Component,
  OnInit,
  ViewChild,
  NgModule,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { UsersManagementService } from 'src/app/core/services/users-management/users-management.service';
import { CreateUserComponent } from '../components/create-user/create-user.component';
import { TopicsComponent } from '../components/topics/topics.component';
import { ConfirmationService } from 'primeng/api';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';
import { LoadingService } from 'src/app/core/services/loading/loading-service.service';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from 'src/app/core/services/config/config.service';

interface UserTableRow {
  username: string;
  // Otras propiedades de fila si las tienes
}

export interface Topic {
  topic_name: string;
  topic_status: string;
  topic_id: string;
}

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss'],
  providers: [ConfirmationService],
})
export class UsersManagementComponent implements OnInit {
  userList!: any[];
  headerList: any[] = [];
  headerButtons: any[] = [];
  customButtons: any[] = [];
  visibleDialog: boolean = false;
  currentStep: number = -1;
  buttonIsEnabled: boolean = false;
  visibleTopics: boolean = false;
  selectedUsername: string | null = null;
  username: any = '';
  confirmationMessage = '';
  topicsListEnable: Topic[] = [];
  topicsListDisable: Topic[] = [];
  isEdit: boolean = false;
  userCount: number = 0;
  deleteMessage: boolean = true;
  topicParamMap: any = this.route.snapshot.paramMap.get('topic');

  //ViewChild Data
  @ViewChild(CreateUserComponent) child;
  @ViewChild(TopicsComponent) topic;
  @ViewChild('cd') confirmationDialog: any;

  @Input() page: any = '';
  @Input() topicsList: Topic[] = [];

  constructor(
    private configService: ConfigService,
    private usersManagementService: UsersManagementService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private loadingService: LoadingService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef
  ) {
    this.page = this.configService.userManagement(this.userService.language);
    this.page = this.page.default;
    this.headerList = this.page.headerList;
    this.headerButtons = this.page.headerButtons;
    this.customButtons = this.page.customButtons;
    this.getUserList();
    this.loadTopicList();
  }

  ngAfterViewInit() {
    if (this.topicParamMap == 'topics') {
      this.selectedOptions(0, {});
      this.changeDetector.detectChanges();
    }
  }

  getUserList() {
    this.loadingService.show();
    this.usersManagementService.PostUserList().subscribe({
      next: (res: any[]) => {
        this.loadingService.hide();
        this.userList = res; // Asigna la lista de usuarios
        this.username = this.userList.map((user) => user.username);
        this.userCount = this.userList.length;
      },
      error: () => {
        this.loadingService.hide();
        const notification: ToastNotification = {
          title: this.page.create_user.failed_load_users.title,
          content: this.page.create_user.failed_load_users.content,
          success_status: false,
        };
        this.messageService.Notify(notification);
      },
    });
  }

  selectUser(username: string) {
    this.username = username; // Asigna el valor del username
  }

  confirmDelete(username: string) {
    // Asignar el valor del username seleccionado a la propiedad selectedUsername
    this.selectedUsername = username;

    this.confirmationService.confirm({
      message: this.page.confirm_delete_user,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(this.selectedUsername); // Pasar selectedUsername como argumento
        this.visibleDialog = false;
        this.getUserList();
      },
      reject: () => {
        // El usuario ha cancelado la acción, vuelve a cargar la lista de temas
        this.getUserList();
      },
    });
  }

  deleteUser(username: string) {
    if (username) {
      // Encuentra al usuario en la lista por su nombre de usuario para obtener su correo electrónico
      const user = this.userList.find((user) => user.username === username);

      if (user && user.email) {
        const body = {
          username: username,
          email: user.email, // Usar el correo electrónico del usuario a eliminar
          admin:
            this.userService.role == 'ADMIN'
              ? this.userService.email
              : this.userService.admin,
        };

        this.loadingService.show();
        this.usersManagementService.deleteUser(body).subscribe({
          next: (res) => {
            this.loadingService.hide();
            const notification: ToastNotification = {
              title: this.page.create_user.deleted_user.title,
              content: this.page.create_user.deleted_user.content,
              success_status: true,
            };

            this.messageService.Notify(notification);

            this.getUserList();
          },
          error: () => {
            this.loadingService.hide();
            const notification: ToastNotification = {
              title: 'Error',
              content: this.page.create_user.deleted_user.content_error,
              success_status: false,
            };

            // Mostrar la notificación de error usando tu servicio de notificaciones
            this.messageService.Notify(notification);
          },
        });
      } else {
      }
    } else {
    }
  }

  loadTopicList(): void {
    this.usersManagementService.GetTopic().subscribe((res: any) => {
      this.topicsListEnable = [];
      this.topicsListDisable = [];
      for (let topics of res) {
        if (topics.topic_status == 'ENABLED') {
          this.topicsListEnable.push(topics);
        } else {
          this.topicsListDisable.push(topics);
        }
      }
    });
  }

  selectedOptions(buttonId: number, rowData: any) {
    this.isEdit = false;
    switch (buttonId) {
      case 0: {
        this.visibleTopics = true;
        this.topic.showDialog();
        this.topic.enable();
        break;
      }
      case 1: {
        this.visibleDialog = true;
        this.child.resetSelected();
        this.child.enable();

        break;
      }
      case 2: {
        if (rowData && rowData.username) {
          // Verifica el limite de usuarios creados (10)
          this.deleteMessage = true;
          this.username = rowData.username; // Establece this.username como el username seleccionado
          this.confirmDelete(this.username);
        } else {
        }
        break;
      }
      case 3: {
        this.router.navigateByUrl('/users/' + rowData.email + '/documents');
        break;
      }
      case 4: {
        this.visibleDialog = true;
        this.isEdit = true;
        this.child.resetSelected();
        this.child.enable();
        this.child.setForm(rowData);
        break;
      }
    }
  }

  hideDialog() {
    this.visibleDialog = false;
    this.visibleTopics = false;
    this.currentStep = -1;
  }

  buttonEnabled(isValid: boolean) {
    this.buttonIsEnabled = isValid;
  }

  selectedButton(data: any) {
    this.visibleDialog = true;
    this.visibleTopics = true;
    this.child.enable();
  }

  ngOnInit() {}

  closeModal() {
    this.visibleTopics = false;
  }
  refresh() {
    window.location.reload();
  }

  //Popup de error de creditos insuficientes
  creditsErrorPopup() {
    this.confirmationService.confirm({
      message: this.page.users_limit_confirmation.message,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {},
      reject: () => {},
    });
  }
}
