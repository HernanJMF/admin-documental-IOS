import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/core/services/loading/loading-service.service';
import { MessageService } from 'src/app/core/services/messages/message.service';
import { ProfileManagementService } from 'src/app/core/services/profile/profile-management.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { ToastNotification } from 'src/app/shared/types/ToastNotification';

@Component({
  selector: 'app-business-config',
  templateUrl: './business-config.component.html',
  styleUrls: ['./business-config.component.scss'],
})
export class BusinessConfigComponent {
  formGroup: FormGroup;
  isValid: boolean = false;
  expandURL: string = '';
  reduceURL: string = '';
  reduceLogo: string = '';
  expandLogo: string = '';
  isExpanded: boolean = false;
  isReduced: boolean = false;
  expandedLogoBlob: any;
  reducedLogoBlob: any;

  @Input() page: any;

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileManagementService,
    private loadingService: LoadingService,
    private messageService: MessageService,
    private userService: UserService,
    private router: Router
  ) {
    this.reduceLogo = this.userService.sidebarLogo;
    this.expandLogo = this.userService.expandLogo;
    this.resetForm();
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      expandLogo: [''],
      reduceLogo: [''],
    });

    this.formGroup.statusChanges.subscribe((status) => {
      this.isValid = status == 'VALID' ? true : false;
    });
  }

  async onExpandFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      // Verificar las dimensiones de la imagen
      const isSizeValid = await this.checkImageDimensions(
        file,
        250,
        80,
        750,
        240
      );

      if (!isSizeValid) {
        // Mostrar mensaje de error
        const notification: ToastNotification = {
          title: 'Error',
          content: this.page.recommended_size_expanded_logo_error_message,
          success_status: false,
        };
        this.messageService.Notify(notification);
        return;
      }

      this.formGroup.controls['expandLogo'].setValue(file);
      this.expandURL = URL.createObjectURL(file);
      this.isExpanded = true;

      await this.onloadedReader(file).then((result) => {
        this.expandedLogoBlob = this.dataURLtoBlob(result);
      });
    }
  }

  async checkImageDimensions(
    file: any,
    minWidth: number,
    minHeight: number,
    maxWidth: number,
    maxHeight: number
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        resolve(
          width >= minWidth &&
            height >= minHeight &&
            width <= maxWidth &&
            height <= maxHeight
        );
      };
    });
  }

  async onReduceFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      // Verificar las dimensiones de la imagen
      const isSizeValid = await this.checkImageDimensions(
        file,
        50,
        50,
        150,
        150
      );

      if (!isSizeValid) {
        // Mostrar mensaje de error
        const notification: ToastNotification = {
          title: 'Error',
          content: this.page.recommended_size_reduced_logo_error_message,
          success_status: false,
        };
        this.messageService.Notify(notification);
        return;
      }

      this.formGroup.controls['reduceLogo'].setValue(file);
      this.reduceURL = URL.createObjectURL(file);
      this.isReduced = true;

      await this.onloadedReader(file).then((result) => {
        this.reducedLogoBlob = this.dataURLtoBlob(result);
      });
    }
  }

  cancelLogos() {
    this.reduceURL = '';
    this.expandURL = '';
    this.expandedLogoBlob = '';
    this.reducedLogoBlob = '';
    this.isReduced = false;
    this.isExpanded = false;
    this.resetForm();
  }

  submitLogos() {
    let expandedName: string = '';
    let reducedName: string = '';
    if (this.isExpanded && this.isReduced) {
      expandedName = this.formGroup.controls['expandLogo'].value.name;
      reducedName = this.formGroup.controls['reduceLogo'].value.name;
    } else if (this.isExpanded && !this.isReduced) {
      expandedName = this.formGroup.controls['expandLogo'].value.name;
    } else if (!this.isExpanded && this.isReduced) {
      reducedName = this.formGroup.controls['reduceLogo'].value.name;
    }

    this.loadingService.show();
    this.profileService
      .getLogosURL(expandedName, reducedName, this.isExpanded, this.isReduced)
      .subscribe({
        next: (response: any) => {
          if (this.isExpanded && this.isReduced) {
            this.uploadImage(response.expand_logo, true);
            this.uploadImage(response.sidebar_logo, false);
          } else if (this.isExpanded && !this.isReduced) {
            this.uploadImage(response.expand_logo, true);
          } else if (!this.isExpanded && this.isReduced) {
            this.uploadImage(response.sidebar_logo, false);
          }
        },
        error: () => {
          this.loadingService.hide();
          const notification: ToastNotification = {
            title: this.page.upload_image_error.title,
            content: this.page.upload_image_error.content,
            success_status: false,
          };
          this.messageService.Notify(notification);
        },
      });
  }

  uploadImage(url: string, expandedImg: boolean) {
    this.profileService
      .PutImage(
        url,
        expandedImg ? this.expandedLogoBlob : this.reducedLogoBlob,
        expandedImg
          ? this.formGroup.controls['expandLogo'].value.type
          : this.formGroup.controls['reduceLogo'].value.type
      )
      .subscribe({
        next: (res) => {
          if (expandedImg) {
            this.userService.updateLogo(
              this.formGroup.controls['expandLogo'].value.name,
              expandedImg
            );
            this.isExpanded = false;
          } else {
            this.userService.updateLogo(
              this.formGroup.controls['reduceLogo'].value.name,
              expandedImg
            );
            this.isReduced = false;
          }
          this.loadingService.hide();
          if (!this.isExpanded && !this.isReduced) {
            this.router.navigate([`/settings/Logosuccess`]).then(() => {
              window.location.reload();
            });
          }
        },
        error: () => {
          this.loadingService.hide();
          const notification: ToastNotification = {
            title: this.page.upload_image_error.title,
            content: this.page.upload_image_error.content,
            success_status: false,
          };
          this.messageService.Notify(notification);
        },
      });
  }

  async onloadedReader(file: any) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => reject(error);
    });
  }

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
}
