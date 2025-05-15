import { Component } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  FormControl,
} from '@angular/forms';
import { LoadingService } from 'src/app/core/services/loading/loading-service.service';
import { LocalStorageService } from 'src/app/core/services/localStorage/local-storage.service';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { ProfileManagementService } from 'src/app/core/services/profile/profile-management.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersManagementService } from 'src/app/core/services/users-management/users-management.service';
import { NGB_DATEPICKER_18N_FACTORY } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker-i18n';
import { ConfigService } from 'src/app/core/services/config/config.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  page: any;
  formGroup: FormGroup;
  activeIndex: number = 0;
  buttonIsEnabled: boolean = false;
  topicList: any[] = [];
  role: string = '';
  plan: string = '';

  statusParamMap: any = this.route.snapshot.paramMap.get('status');
  languageList: any[] = [
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private configService: ConfigService,
    private locaStorage: LocalStorageService,
    private profileService: ProfileManagementService,
    private usersManagementService: UsersManagementService,
    private messageService: MessageService,
    private loadingService: LoadingService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.page = this.configService.settings(this.userService.language);
    this.page = this.page.default;
    this.plan = this.userService.plan;
    this.role = this.userService.role;
    this.resetForm();
    this.loadTopicList();
  }

  ngOnInit(): void {
    if (this.statusParamMap == 'success') {
      this.location.replaceState('/settings');
      const notification: ToastNotification = {
        title: this.page.profile.submitProfile.title,
        content: this.page.profile.submitProfile.content,
        success_status: true,
      };
      this.messageService.Notify(notification);
    } else if (this.statusParamMap == 'Logosuccess') {
      const notification: ToastNotification = {
        title: this.page.business_config.submit_image.title,
        content: this.page.business_config.submit_image.content,
        success_status: true,
      };
      this.messageService.Notify(notification);
    }
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      first_name: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð,-\d ' -]+$/
          ),
          this.noWhitespaceValidator,
          this.customValidator,
        ],
      ],
      last_name: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð,-\d ' -]+$/
          ),
          this.noWhitespaceValidator,
          this.customValidator,
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
          ),
        ],
      ],
      role: [''],
      language: ['', [Validators.required]],
      topic: [''],
      old_password: [''],
      change_password: [''],
    });

    this.formGroup.statusChanges.subscribe((status) => {
      this.buttonIsEnabled = status == 'VALID' ? true : false;
    });
  }

  changeIndex(index: any) {
    this.activeIndex = index;
  }

  async loadTopicList() {
    await this.usersManagementService.GetClientTopic('').subscribe({
      next: (res: any) => {
        this.topicList = res.sort((a, b) =>
          a.topic_name > b.topic_name ? 1 : -1
        );
        this.getUserData();
      },
      error: () => {
        this.getUserData();
      },
    });
  }

  getUserData() {
    const data = JSON.parse(
      this.locaStorage.getData('user_settings') as string
    );
    this.formGroup.controls['first_name'].setValue(data.firstName);
    this.formGroup.controls['last_name'].setValue(data.lastName);
    this.formGroup.controls['email'].setValue(data.email);
    this.formGroup.controls['role'].setValue(data.role);
    this.formGroup.controls['language'].setValue(
      this.languageList.find(
        (language: any) => language.value == data.language.toLowerCase()
      )
    );
    if (data.role == 'ADMIN') {
      this.formGroup.controls['topic'].setValue('ALL');
    } else {
      this.formGroup.controls['topic'].setValue(
        this.topicList.map((topic) => topic.topic_name).toString()
      );
    }
    this.formGroup.controls['role'].disable();
    this.formGroup.controls['topic'].disable();
    this.formGroup.controls['email'].disable();
  }

  submitProfile() {
    let body = {
      first_name: this.formGroup.controls['first_name'].value,
      last_name: this.formGroup.controls['last_name'].value,
      admin:
        this.userService.role == 'ADMIN'
          ? this.userService.email
          : this.userService.admin,
      email: this.userService.email,
      language: this.formGroup.controls['language'].value.value,
    };
    this.loadingService.show();
    this.profileService.PatchProfile(body).subscribe({
      next: () => {
        this.loadingService.hide();
        this.router.navigate([`/settings/success`]).then(() => {
          window.location.reload();
        });
      },
      error: () => {
        this.loadingService.hide();
        const notification: ToastNotification = {
          title: this.page.profile.submitProfile_error.title,
          content: this.page.profile.submitProfile_error.content,
          success_status: false,
        };
        this.messageService.Notify(notification);
      },
    });
  }

  public noWhitespaceValidator(control: FormControl) {
    const value = control.value || '';
    if (value.trim() === '') {
      return { whitespace: true };
    } else {
      return null;
    }
  }

  public customValidator(control: FormControl) {
    const value = control.value || '';

    if (/\d/.test(value)) {
      return { numeric: true }; // Contiene caracteres numéricos
    }

    return null; // No contiene caracteres numéricos
  }
}
