import {
  Component,
  OnInit,
  ViewChild,
  Input,
  HostListener,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { LoginRequest } from 'src/app/shared/models/login/login-request';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';
import { PasswordRecoveryComponent } from '../components/password-recovery/password-recovery.component';
import { ConfigService } from 'src/app/core/services/config/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  login: any;
  loginForm: FormGroup;
  value!: string;
  passwordClass: string = '';
  emailClass: boolean = true;
  isValid: boolean;
  showPasswordRecovery = false;
  visible: boolean = false;
  clickedPasswordInput: boolean = false;
  passwordInputBlurred: boolean = false;
  @Input() showUpload: boolean = true;
  @Input() showRegister: boolean = true;
  @Input() page: any = '';
  @ViewChild(PasswordRecoveryComponent) uploadChild;
  innerWidth: number;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    protected router: Router,
    private messageService: MessageService,
    private configService: ConfigService
  ) {
    this.page = this.configService.login('es');
    this.page.default;
    if (this.userService.isAuthenticated) {
      this.router.navigate(['/home']);
    }
    this.resetForm();
    this.innerWidth = window.innerWidth;
  }

  resetForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
    this.loginForm.statusChanges.subscribe((status) => {
      this.isValid = status == 'VALID' ? true : false;
      this.passwordClass =
        this.loginForm.controls['password'].touched &&
        this.loginForm.controls['password'].errors?.['required']
          ? 'ng-invalid ng-dirty'
          : '';
      this.emailClass =
        this.loginForm.controls['username'].touched &&
        this.loginForm.controls['username'].errors?.['required']
          ? false
          : true;
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    let loginBody = new LoginRequest(
      this.loginForm.controls['username'].value,
      this.loginForm.controls['password'].value
    );
    this.userService.login(loginBody).subscribe({
      next: () => {
        this.router.navigate(['/home']).then(() => {
          // window.location.reload();
        });
      },
      error: (err) => {
        // Aquí puedes manejar errores si ocurren
        const notification: ToastNotification = {
          title: 'Credenciales no válidas',
          content:
            '¡Uy! Parece que tus datos de acceso son incorrectos. Compruebe su nombre de usuario y contraseña e inténtelo de nuevo.',
          success_status: false,
        };
        this.messageService.Notify(notification);
      },
    });
  }

  // Método para manejar la redirección al login corporativo
  accessCorporateEmail() {
    const url =
      'https://prod-agrobot-chat2dox.auth.eu-west-1.amazoncognito.com/oauth2/authorize?identity_provider=azureadIdp&client_id=bs7g287gho70r6ri1i97udlfi&response_type=code&redirect_uri=https://agrobot.agroseguro.es/home';
    window.location.href = url;
  }

  onPasswordInputClick() {
    // Este método se llama cuando se hace clic en el input de contraseña
    this.clickedPasswordInput = true;
  }

  onPasswordInputBlur() {
    // Este método se llama cuando el input de contraseña pierde el foco
    this.passwordInputBlurred = true;
  }

  showDialog() {
    this.uploadChild.showDialog();
    this.visible = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }
}
