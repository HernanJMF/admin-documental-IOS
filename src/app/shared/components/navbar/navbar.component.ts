import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { DocumentsListService } from 'src/app/core/services/documents-list/documents-list.service';
import { LocalStorageService } from 'src/app/core/services/localStorage/local-storage.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  version: string = '1.0.8'; //environment.version;
  page: any;
  sidebarVisible: boolean = false;
  documentID: string = '';
  role: string = '';
  theme: boolean = false;
  @Output() changeTheme: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private documentsListService: DocumentsListService,
    protected router: Router,
    private localStorageService: LocalStorageService
  ) {
    this.page = this.configService.sidebar(this.userService.language);
    this.page = this.page.default;
    this.role = this.userService.role;
    this.theme = this.userService.theme == 'light' ? true : false;
  }

  getChatID() {
    this.documentsListService.GetRecentDocument().subscribe({
      next: (res) => {
        if (res.length > 0) {
          this.documentID = res[0].document_id;
        }
      },
    });
  }

  selectedTheme(colorTheme: boolean) {
    this.changeTheme.emit(colorTheme);
  }

  logout() {
    this.sidebarVisible = false;
    this.localStorageService.clearLocalStorage();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}
