import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { DocumentsListService } from 'src/app/core/services/documents-list/documents-list.service';
import { LocalStorageService } from 'src/app/core/services/localStorage/local-storage.service';
import { ProfileManagementService } from 'src/app/core/services/profile/profile-management.service';
import { UserService } from 'src/app/core/services/users/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  version: string = '1.0.8';
  page: any;
  role: string = '';
  theme: boolean = false;
  reduceLogo: string = '';
  expandLogo: string = '';
  displaySidebar: boolean = false;
  documentID: string = '';
  amplifySubscriber: any;
  totalCredits: string = '0';

  @Output() changeTheme: EventEmitter<boolean> = new EventEmitter();
  @Output() updatePlan = new EventEmitter<any>();

  constructor(
    private configService: ConfigService,
    private documentsListService: DocumentsListService,
    private profileManagementService: ProfileManagementService,
    private userService: UserService,
    protected router: Router,
    private localStorageService: LocalStorageService
  ) {
    this.page = this.configService.sidebar(this.userService.language);
    this.page = this.page.default;
    this.role = this.userService.role;
    this.totalCredits = this.userService.credits;
    this.reduceLogo = this.userService.sidebarLogo;
    this.expandLogo = this.userService.expandLogo;
    this.theme = this.userService.theme == 'light' ? true : false;

    //this.activeAppSync();
  }

  ngOnDestroy() {
    if (this.amplifySubscriber) {
      this.amplifySubscriber.unsubscribe();
      //this.activeAppSync();
    }
    this.amplifySubscriber = null;
  }

  /*activeAppSync(){
    this.amplifySubscriber = this.appSync.OnUserUpdateListener(this.userService.admin)
      .subscribe((response: any) => {
        let responseValue = response.value.data.onUserUpdate;
        if(responseValue.subscription_plan == '{}'){
          this.totalCredits = responseValue.credits;
          this.userService.updateCredits(responseValue.credits)
        }else{
          this.totalCredits = responseValue.credits;
          this.userService.updatePlan(responseValue.credits, JSON.parse(responseValue.subscription_plan))
          this.profileManagementService.updatePlan()
        }
        this.ngOnDestroy();
      });
  }*/

  selectedTheme(colorTheme: boolean) {
    this.changeTheme.emit(colorTheme);
  }

  updateSuscriptionInformation(subscription_plan: any) {
    this.updatePlan.emit({ subscription_plan: subscription_plan });
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

  generatelogoUrl(expanded: boolean) {
    if (expanded) {
      let expandedUrl =
        'https://prod-agrobot-chat2dox-main-bucket.s3.eu-west-1.amazonaws.com/' +
        encodeURIComponent(this.expandLogo);
      return expandedUrl;
    } else {
      let reduceddUrl =
        'https://prod-agrobot-chat2dox-main-bucket.s3.eu-west-1.amazonaws.com/' +
        encodeURIComponent(this.reduceLogo);
      return reduceddUrl;
    }
  }

  logout() {
    this.userService.logout();
  }
}
