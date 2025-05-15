import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersManagementService } from 'src/app/core/services/users-management/users-management.service';
import { CreateUserRequest } from 'src/app/shared/models/users/create-users-request';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';
import { UserService } from 'src/app/core/services/users/user.service';
import { LoadingService } from 'src/app/core/services/loading/loading-service.service';
import { Topic } from '../topics/topics.component';
import { ProfileManagementService } from 'src/app/core/services/profile/profile-management.service';


@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
 //Page Variables

 formGroup: FormGroup;//Dropdown data
 languageList : any[] = [
  { label: "English", value: "en" },
  { label: "Español", value: "es" }
];
 password: string;
 isEdit: boolean = false;
 patchBody: any;
 selected: Topic[] = [];

 //INPUT AND OUPUTS
 @Output() updateList = new EventEmitter();
 @Output() buttonEnabled = new EventEmitter<boolean>();
 @Input() page: any = "";
 @Input() enabledTopics:  any[] = [];


 constructor(
   private formBuilder: FormBuilder,
   private userService: UserService,
   private usersManagementService: UsersManagementService,
   private profileService: ProfileManagementService,
   private messageService: MessageService,
   private loadingService: LoadingService
 ) {
   this.resetForm();
 }

 ngOnInit(): void {
  // Utiliza el servicio para obtener los tópicos
  this.usersManagementService.GetTopic().subscribe((topics: any[]) => {
    const enabledTopics = topics.filter(topic => topic.topic_status === 'ENABLED');

    // Mapea los nombres de los tópicos habilitados a un arreglo de strings
    this.enabledTopics = enabledTopics;
  });

}

 resetForm(){ //inicializa el formulario de crear usuario
   this.formGroup = this.formBuilder.group({
     first_name: ["", [Validators.required,Validators.pattern(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð,-\d ' -]+$/), this.noWhitespaceValidator, this.customValidator]],
     last_name: ["", [Validators.required,Validators.pattern(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð,-\d ' -]+$/), this.noWhitespaceValidator, this.customValidator]],
     email: ["", [Validators.required,Validators.pattern(/^([a-zA-Z0-9_\-\.\+]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/), this.noWhitespaceValidator]],
     role: ["",],
     language:["",[Validators.required]],
     topic: [[],[Validators.required]],
   });
   this.formGroup.statusChanges.subscribe(status => {
     this.buttonEnabled.emit(status == "VALID" ? true : false);
   });
   this.isEdit = false;

 }

 submitCall(){ //Valida si se esta editando o creando el usuario
  if(this.isEdit){
    this.updateProfile();
  }else{
    this.submit()
  }
 }

 submit() { //Genera la peticion para crear un usuario nuevo
  if (this.formGroup.valid) {

    const userBody = new CreateUserRequest(
      this.userService.email,
      this.formGroup.get('first_name').value,
      this.formGroup.get('last_name').value,
      this.formGroup.get('email').value,
      this.formGroup.get('topic').value.map((topic) => topic.topic_id),
      this.formGroup.get('topic').value.map((topic) => topic.topic_name),
      "",
      this.formGroup.get('language').value.value
    );
    this.loadingService.show();
    this.usersManagementService.PostNewUser(userBody).subscribe({
      next: () => {
        // Limpiar el formulario después de crear el usuario
        this.updateList.emit()
        this.selected = [];
        this.loadingService.hide();
        const notification: ToastNotification = {
          title: this.page.add_user.title,
          content: this.page.add_user.content,
          success_status: true,
        };

        // Mostrar la notificación de éxito usando tu servicio de notificaciones
        this.messageService.Notify(notification);

      },
      error: (err) => {
        this.loadingService.hide();
        let notification: ToastNotification;
        if(err.error.type == 'UsernameExistsException'){
          notification = {
            title: this.page.duplicated_user_error.title,
            content: this.page.duplicated_user_error.content,
            success_status: false,
        };
        }else{
          notification = {
            title: 'Error',
            content: this.page.add_user.content_error,
            success_status: false,
          };
        }
        // Mostrar la notificación de error usando tu servicio de notificaciones
        this.messageService.Notify(notification);

      }
    });
  }
}

 resetSelected(){
  this.selected = []
 }

 enable(){
  if (this.formGroup) { // Verificar si formGroup está definido
    this.formGroup.controls['email'].enable();

  }
 }

 setForm(rowData: any){ //inicializa los valores en el modal en caso de necesitarlos para editarlo
  this.isEdit = true;
  this.formGroup.controls['email'].setValue(rowData.email);
  this.formGroup.controls['email'].disable();
  this.formGroup.controls['last_name'].setValue(rowData.last_name);
  this.formGroup.controls['topic'].setValue(this.enabledTopics.filter((enableTopic: any) => {
    return rowData.topic_names.find((assignedTopic: any) => assignedTopic.toLowerCase() == enableTopic.topic_name.toLowerCase());
  }));
  this.formGroup.get('language').setValidators([]); // or clearValidators()
  this.formGroup.get('email').setValidators([]); // or clearValidators()
  this.formGroup.get('language').updateValueAndValidity();
  this.formGroup.get('email').updateValueAndValidity();
  this.formGroup.statusChanges.subscribe(status => {
    this.buttonEnabled.emit(status == "VALID" ? true : true);
  });

  this.patchBody ={
    first_name: "",
    last_name: "",
    admin: this.userService.admin,
    email: rowData.email,
    topic: [],
    topic_names: []
  }

 }

 updateProfile(){
  this.patchBody['email'] = this.formGroup.controls['email'].value;
  this.patchBody['last_name'] = this.formGroup.controls['last_name'].value;
  this.patchBody['topic'] = this.formGroup.get('topic').value.map((topic) => topic.topic_id);
  this.patchBody['topic_names'] = this.formGroup.get('topic').value.map((topic) => topic.topic_name);

  this.loadingService.show();
  this.profileService.PatchProfile(this.patchBody).subscribe({
    next: () => {
      this.updateList.emit();
      this.loadingService.hide();
      const notification: ToastNotification = {
        title: this.page.submitProfile.title,
        content: this.page.submitProfile.content,
        success_status: true,
      };
      this.messageService.Notify(notification);
      //notify falta
    },
    error: () =>{
      this.loadingService.hide();
      const notification: ToastNotification = {
        title: this.page.submitProfile_error.title,
        content: this.page.submitProfile_error.content,
        success_status: false,
      };
      this.messageService.Notify(notification);
    }
  })

}

objectKeys (objeto: any) {
  return Object.keys(objeto);

}

public noWhitespaceValidator(control: FormControl) {
  if (control.value && control.value.trim() === '') {
      return { 'whitespace': true };
  }
  return null;
}

public customValidator(control: FormControl) {
  const value = control.value || '';

  if (/\d/.test(value)) {
    return { 'numeric': true }; // Contiene caracteres numéricos
  }

  return null; // No contiene caracteres numéricos
}

}
