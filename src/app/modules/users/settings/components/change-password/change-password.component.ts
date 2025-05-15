import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { LoadingService } from 'src/app/core/services/loading/loading-service.service';
import { LocalStorageService } from 'src/app/core/services/localStorage/local-storage.service';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { ProfileManagementService } from 'src/app/core/services/profile/profile-management.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  formGroup: FormGroup;
  buttonIsEnabled: boolean = false
  passwordStatus: string = '';
  clickedPasswordInput: boolean = false;
  passwordInputBlurred: boolean = false;
  showForm: boolean = false;

  @Input() page: any;

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileManagementService,
    private messageService: MessageService,
    private loadingService: LoadingService,
    private userService: UserService,
    private locaStorage: LocalStorageService,

    ) {
      this.resetForm();
    }

    ngOnInit(): void {

      const userData = this.locaStorage.getJSON('user_settings');
      this.showForm = !userData?.externalProvider;
    }

  resetForm(){ //inicializa el formulario de cambiar contraseña
    this.formGroup = this.formBuilder.group({
      oldPassword: ["", [Validators.required]],
      changePassword: ["", [Validators.required]],
      confirmPassword: ["", [Validators.required]]
    },
    {
      validator: this.ConfirmedValidator('changePassword', 'confirmPassword'),
    });

    this.formGroup.statusChanges.subscribe(status => {
      this.buttonIsEnabled = (status == "VALID" ? true : false);
    });

  }

  refreshToken(){ //Refresca el token en caso de necesitarlo
    this.loadingService.show();
    this.userService.tokenRefresh().subscribe({
      next: (res) => {
        this.submitPassword();
      },
      error: (err) =>{
        this.loadingService.hide();
        const notification = {
          title: this.page.submitPassword_error.title,
          content: this.page.submitPassword_error.content,
          success_status: false,
        }
        this.messageService.Notify(notification);
      }
    })
  }

  submitPassword(){ //Peticion que permite actualizar la contraseña
    this.profileService.PatchPassword(this.formGroup.controls['changePassword'].value,this.formGroup.controls['oldPassword'].value, this.userService.accessToken).subscribe({
      next: () => {
        this.resetForm();
        this.loadingService.hide();
        const notification: ToastNotification ={
          title: this.page.submitPassword.title,
          content: this.page.submitPassword.content,
          success_status: true,
        };
        this.messageService.Notify(notification);
      },
      error: () =>{
        this.loadingService.hide();
        const notification = {
          title: this.page.submitPassword_error.title,
          content: this.page.submitPassword_error.content,
          success_status: false,
        };
        this.messageService.Notify(notification);
      }
    })
  }

  //De aqui en adelante son solamente validaciones para casos especificos del formulario

  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
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

  isLowercaseValid(): boolean {
    // Verifica si al menos una minúscula está presente
    const passwordControl = this.formGroup.get('changePassword');
    const passwordValue = passwordControl.value;

    return /[a-z]/.test(passwordValue);
  }

  isUppercaseValid(): boolean {
    // Verifica si al menos una mayúscula está presente
    const passwordControl = this.formGroup.get('changePassword');
    const passwordValue = passwordControl.value;

    return /[A-Z]/.test(passwordValue);
  }

  isNumericValid(): boolean {
    // Verifica si al menos un número está presente
    const passwordControl = this.formGroup.get('changePassword');
    const passwordValue = passwordControl.value;

    return /\d/.test(passwordValue);
  }

  isLengthValid(): boolean {
    // Verifica si la longitud es de al menos 8 caracteres
    const passwordControl = this.formGroup.get('changePassword');
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
    return specialCharacterPattern.test(this.formGroup.controls['changePassword'].value);
  }

  isPasswordValid(): boolean {
    const passwordControl = this.formGroup.get('changePassword');
    const passwordValue = passwordControl.value;

    const isLowercase = /[a-z]/.test(passwordValue);
    const isUppercase = /[A-Z]/.test(passwordValue);
    const isNumeric = /\d/.test(passwordValue);
    const isLengthValid = passwordValue.length >= 8;
    const isSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(passwordValue);

    return isLowercase && isUppercase && isNumeric && isLengthValid && isSpecialCharacter;
  }

}

