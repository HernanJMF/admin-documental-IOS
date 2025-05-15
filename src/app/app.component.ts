import { Component, ElementRef, OnInit } from '@angular/core';
import { UserService } from './core/services/users/user.service';
import { ConfigService } from './core/services/config/config.service';

export enum ScssVariables {
  Light = 'light',
  Dark = 'dark',
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Chatbot';
  isLogged: boolean = false;
  page: any;
  lightTheme: boolean = false;
  public styles: { [key in ScssVariables]: string | null } = {
    light: null,
    dark: null,
  };

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private elem: ElementRef
  ) {
    this.isLogged = this.userService.isAuthenticated;
    this.page = this.configService.theme(
      this.isLogged ? this.userService.theme : 'light'
    );
    this.page = this.page.default;
    Object.keys(this.page).forEach((key: any) => {
      this.elem.nativeElement.style.setProperty('--bs-' + key, this.page[key]);
    });
  }

  ngOnInit(): void {
    this.userService.userDataObservable.subscribe(() => {
      this.isLogged = this.userService.isAuthenticated;
    });
  }

  selectedTheme(colorTheme: boolean) {
    this.lightTheme = colorTheme;
    this.userService.updateTheme(this.lightTheme ? 'light' : 'dark');
    this.page = this.configService.theme(this.userService.theme);
    this.page = this.page.default;
    Object.keys(this.page).forEach((key: any) => {
      this.elem.nativeElement.style.setProperty('--bs-' + key, this.page[key]);
    });
  }
}
