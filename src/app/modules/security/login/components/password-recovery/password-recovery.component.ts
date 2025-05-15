import { Component, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { UserService } from 'src/app/core/services/users/user.service';
import { confimrForgotPasswordRequest } from 'src/app/shared/models/login/confirm-forgot-password';
import { recoveryRequest } from 'src/app/shared/models/login/password-recovery-request';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { ConfigService } from 'src/app/core/services/config/config.service';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss']
})
export class PasswordRecoveryComponent {
  recovery: any;
  pages: any;
  visible: boolean = false;
  recoveryForm: FormGroup;
  confirmChangePassword: FormGroup;
  showAdditionalFields: boolean = false;
  clickedPasswordInput: boolean = false;
  passwordInputBlurred: boolean = false;
  buttonIsEnabled: boolean = false
  showSuggestions: boolean = false;
  value: string;
  @Input() page: any = "";

  constructor(private userService: UserService,
              private formBuilder: FormBuilder,
              private messageService: MessageService,
              private configService: ConfigService) {

    this.page = this.configService.login('es');
    this.resetRecoveryForm();
    this.resetForm();


  }
  resetRecoveryForm() { //Formulario de solicitud del código para cambio de contraseña
    this.recoveryForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]]
    });
  }

  resetForm() { //Formulario para enviar la nueva contraseña
    this.confirmChangePassword = this.formBuilder.group({
      code: ["", [Validators.required]],
      newPassword: ["", [Validators.required]],
      confirmPassword: ["", [Validators.required]]
    },
    {
      validator: this.ConfirmedValidator('newPassword', 'confirmPassword'), //Validación para que la contraseña sea igual en ambos campos
    });

    this.confirmChangePassword.statusChanges.subscribe(status => { 
      //Este subscribe queda activo obteniendo los valores del formulario para hacer validaciones
      this.buttonIsEnabled = status === "VALID";
    });
  }

  onSubmit() { //Envia formulario de solicitud de código de recuperación
    const body = new recoveryRequest('forgot_password', this.recoveryForm.value.email);
    this.userService.recoveryCode(body).subscribe((res) => {

    }, (error) => {
      // Maneja el error de la consulta
    });
    this.showAdditionalFields = true;
  }

  sendNewPassword() { //envia la solicitud para actualizar la contraseña
    const email = this.recoveryForm.get('email').value;
    const body = new confimrForgotPasswordRequest(
      'confirm_forgot_password',
      email,
      this.confirmChangePassword.value.code,
      this.confirmChangePassword.value.newPassword

    );

    this.userService.passwordRecovery(body).subscribe((res) => {
      const notification: ToastNotification = {
        title: this.page.recovery_password.update_password_title,
        content: this.page.recovery_password.update_password_content,
        success_status: true,
      };
      this.messageService.Notify(notification);
      // Realiza las acciones necesarias con la respuesta del servidor
    }, (error) => {
      // Maneja el error de la consulta
      const notification: ToastNotification = {
        title: this.page.recovery_password.error_update_password_title,
        content: this.page.recovery_password.error_update_password_content,
        success_status: false,
      };
      this.messageService.Notify(notification);
    });
    this.showAdditionalFields = false;
    this.visible = false;
  }

  //Todos los metodos siguientes se usan para validar que los campos cumplan las condiciones
  

  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (confirmChangePassword: FormGroup) => {
      const control = confirmChangePassword.controls[controlName];
      const matchingControl = confirmChangePassword.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors['confirmedValidator']
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  isPasswordValid(): boolean {
    const newPasswordControl = this.confirmChangePassword.get('newPassword');
    return newPasswordControl.valid && this.isLowercaseValid() && this.isUppercaseValid() && this.isNumericValid() && this.isLengthValid() && this.isSpecialCharacterValid();
}

  returnEmail(){
    this.showAdditionalFields = false;
    this.visible = false;
    this.visible = true;
  }

  showDialog() {
    this.visible = true;
    this.showAdditionalFields = false;
  }

  isLowercaseValid(): boolean {
    // Verifica si al menos una minúscula está presente
    const passwordControl = this.confirmChangePassword.get('newPassword');
    const passwordValue = passwordControl.value;

    return /[a-z]/.test(passwordValue);
  }

  isUppercaseValid(): boolean {
    // Verifica si al menos una mayúscula está presente
    const passwordControl = this.confirmChangePassword.get('newPassword');
    const passwordValue = passwordControl.value;

    return /[A-Z]/.test(passwordValue);
  }

  isNumericValid(): boolean {
    // Verifica si al menos un número está presente
    const passwordControl = this.confirmChangePassword.get('newPassword');
    const passwordValue = passwordControl.value;

    return /\d/.test(passwordValue);
  }

  isLengthValid(): boolean {
    // Verifica si la longitud es de al menos 8 caracteres
    const passwordControl = this.confirmChangePassword.get('newPassword');
    const passwordValue = passwordControl.value;

    return passwordValue.length >= 8;
  }

  onPasswordInputClick() {
    // Este método se llama cuando se hace clic en el input de contraseña
    this.clickedPasswordInput = true;
  }

  onPasswordInputBlur() {
    // Este método se llama cuando el input de contraseña pierde el foco
    this.passwordInputBlurred = true;
  }

isSpecialCharacterValid(): boolean {
    // Define una expresión regular que coincida con caracteres especiales
    const specialCharacterPattern = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/;

    // Comprueba si la contraseña contiene al menos un carácter especial
    return specialCharacterPattern.test(this.confirmChangePassword.controls['newPassword'].value);
}

isEmailValid(email: string): boolean {
  return email.trim() !== ''; // Verifica si el correo electrónico no está vacío
}

}
