import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { UserService } from 'src/app/core/services/users/user.service';

@Component({
  selector: 'app-user-documents',
  templateUrl: './user-documents.component.html',
  styleUrls: ['./user-documents.component.scss']
})
export class UserDocumentsComponent {

  //Esta vista sirve para observar los documentos de un usuario desde un administrador

  emailIDParamMap: any = this.route.snapshot.paramMap.get('email');
  page: any;
  
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private route: ActivatedRoute,
    ){
    this.page = this.configService.userManagement(this.userService.language);
    this.page = this.page.default.user_document;
  }
}
