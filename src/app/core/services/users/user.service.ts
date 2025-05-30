import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  firstValueFrom,
  map,
} from 'rxjs';
import { HttpService } from '../../http/http.service';
import { LoginRequest } from 'src/app/shared/models/login/login-request';
import { LocalStorageService } from '../localStorage/local-storage.service';
import { ConfigService } from '../config/config.service';
import { recoveryRequest } from 'src/app/shared/models/login/password-recovery-request';
import { confimrForgotPasswordRequest } from 'src/app/shared/models/login/confirm-forgot-password';
import { registerRequest } from 'src/app/shared/models/login/register-user-request';
import { jwtDecode } from 'jwt-decode';

import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _userSettings: any = null;
  private user: any;
  private userDataSubject = new BehaviorSubject<any>({});
  userDataObservable = this.userDataSubject.asObservable();

  constructor(
    private httpService: HttpService,
    private http: HttpClient,
    private configService: ConfigService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  private get userSettings(): any {
    return this._userSettings;
  }

  setUserSettings(userSettings: any): void {
    this.localStorageService.saveJSON('user_settings', userSettings);
    this._userSettings = userSettings;
    this.userDataSubject.next({});
  }

  // Método para obtener la configuración del usuario
  getUserSettings(): any {
    return this.localStorageService.getJSON('user_settings');
  }

  private set userSettings(value: any) {
    this.localStorageService.saveJSON('user_settings', value);
    this._userSettings = this.localStorageService.getJSON('user_settings');
  }

  public get email(): string {
    return this.localStorageService.getJSON('user_settings').username;
  }

  public get admin(): string {
    return this.localStorageService.getJSON('user_settings').admin;
  }

  public get role(): string {
    return this.localStorageService.getJSON('user_settings').role;
  }

  public get statusPlan(): string {
    return this.localStorageService.getJSON('user_settings').statusPlan;
  }

  public get plan(): string {
    return this.localStorageService.getJSON('user_settings').plan;
  }

  public get price(): string {
    return this.localStorageService.getJSON('user_settings').price;
  }

  public get renewDate(): string {
    return this.localStorageService.getJSON('user_settings').renew_date;
  }

  public get firstName(): string {
    return this.localStorageService.getJSON('user_settings').firstName;
  }

  public get language(): string {
    return this.localStorageService.getJSON('user_settings').language;
  }

  public get topics(): [] {
    return this.localStorageService.getJSON('user_settings').topic;
  }

  public get credits(): string {
    return this.localStorageService.getJSON('user_settings').credits;
  }

  public get refreshToken(): string {
    return this.localStorageService.getJSON('user_settings').refreshToken;
  }

  public get accessToken(): string {
    return this.localStorageService.getJSON('user_settings').accessToken;
  }

  public get idToken(): string {
    return this.localStorageService.getJSON('user_settings').idToken;
  }

  public get expiresIn(): string {
    return this.localStorageService.getJSON('user_settings').expiresIn;
  }

  public get theme(): string {
    return this.localStorageService.getJSON('user_settings').theme;
  }

  public get expandLogo(): string {
    return this.localStorageService.getJSON('user_settings').expandLogo;
  }

  public get sidebarLogo(): string {
    return this.localStorageService.getJSON('user_settings').sidebarLogo;
  }

  public get user_data(): any {
    return this.localStorageService.getJSON('user_settings');
  }

  public get isAuthenticated(): boolean {
    const userData = this.localStorageService.getJSON('user_settings') || true;

    return userData?.isLogged || false;
  }

  public get username(): string {
    return this.localStorageService.getJSON('user_settings').email;
  }

  setUser(userSettings: any) {
    this.user = userSettings;
    // Aquí podrías realizar otras acciones necesarias para actualizar el estado del usuario
  }

  login(body: LoginRequest): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'no-auth': 'true',
      'no-token-refresh': 'true',
    };
    return this.httpService

      .post(`${this.configService.config.endpoints.login}`, body, headers)
      .pipe(
        map((res: any) => {
          let user_settings = {
            isLogged: true,
            firstName: res.user_data.first_name || '',
            email: res.user_data.email || '',
            lastName: res.user_data.last_name || '',
            role: res.user_data.role || '',
            userStatus: res.user_data.user_status || '',
            statusPlan: res.user_data.status_plan || '',
            plan:
              res.user_data.plan == undefined
                ? res.user_data.user_plan
                : res.user_data.plan,
            language: res.user_data.language.toLowerCase(),
            tokensLimit: res.user_data.tokens_limit,
            topic: res.user_data.topic || '',
            admin: res.user_data.admin || '',
            idToken: res.id_token,
            accessToken: res.access_token,
            refreshToken: res.refresh_token,
            expiresIn: res.expires_in,
            expandLogo: res.user_data.expand_logo || '',
            sidebarLogo: res.user_data.sidebar_logo || '',
            renew_date: res.user_data.period_end_date || '',
            price: res.user_data.plan_amount || '',
            theme: 'light',
            credits: res.user_data.credits || '',
            username: res.user_data.email,
            externalProvider: false

          };
          this.userSettings = user_settings;
          this.localStorageService.saveJSON('user_settings', user_settings);
          this.userDataSubject.next({});
          return res;
        }),
        catchError((err): any => {
          // Manejo de errores
        })
      );
  }

  logout() {
    // Limpia el localStorage antes de cerrar sesión
    this.localStorageService.clearLocalStorage();

    // Opcional: navega a la pantalla de login interna de tu app
    // Si usas Angular Router, descomenta la siguiente línea:
     this.router.navigate(['/login']);
  }



  tokenRefresh(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.httpService
      .post(
        `${this.configService.config.endpoints.refresh_token}`,
        { refresh_token: this.refreshToken,
          username: this.username
         },
        headers
      )
      .pipe(
        map((res: any) => {
          this.updateTokens(res.access_token, res.id_token);
          return res;
        }),
        catchError((err): any => {
          //this.errorService.HandleError(err);
        })
      );
  }

  recoveryCode(body: recoveryRequest) {
    const headers = {
      'Content-Type': 'application/json',
      'no-auth': 'true',
      'no-token-refresh': 'true',
    };
    return this.httpService
      .post(
        `${this.configService.config.endpoints.recovery_code}`,
        body,
        headers
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  passwordRecovery(body: confimrForgotPasswordRequest) {
    const headers = {
      'Content-Type': 'application/json',
      'no-auth': 'true',
      'no-token-refresh': 'true',
    };
    return this.httpService
      .post(
        `${this.configService.config.endpoints.forgot_password}`,
        body,
        headers
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  updateLanguage(body: any) {
    let updatedUserData = this.localStorageService.getJSON('user_settings');
    updatedUserData.language = body.language;
    updatedUserData.firstName = body.first_name;
    updatedUserData.lastName = body.last_name;
    this.localStorageService.saveJSON('user_settings', updatedUserData);
  }

  updateTheme(theme: string) {
    let updatedUserData = this.localStorageService.getJSON('user_settings');
    updatedUserData.theme = theme;
    this.localStorageService.saveJSON('user_settings', updatedUserData);
  }

  updateLogo(logoName: string, isExpanded: boolean) {
    let updatedUserData = this.localStorageService.getJSON('user_settings');
    if (isExpanded) {
      updatedUserData.expandLogo =
        'documents/' +
        encodeURIComponent(this.admin) +
        '/profile/' +
        encodeURIComponent(logoName);
    } else {
      updatedUserData.sidebarLogo =
        'documents/' +
        encodeURIComponent(this.admin) +
        '/profile/' +
        encodeURIComponent(logoName);
    }
    this.localStorageService.saveJSON('user_settings', updatedUserData);
  }

  updateTokens(accessToken: string, idToken: string) {
    let updatedUserData = this.localStorageService.getJSON('user_settings');
    updatedUserData.accessToken = accessToken;
    updatedUserData.idToken = idToken;
    this.localStorageService.saveJSON('user_settings', updatedUserData);
  }

  updateCredits(credits: string) {
    let updatedUserData = this.localStorageService.getJSON('user_settings');
    updatedUserData.credits = credits;
    this.localStorageService.saveJSON('user_settings', updatedUserData);
  }

  updatePlan(credits: string, subscription_plan: any) {
    let updatedUserData = this.localStorageService.getJSON('user_settings');
    updatedUserData.credits = credits;
    updatedUserData.plan = subscription_plan.name_plan;
    updatedUserData.statusPlan = subscription_plan.status;
    updatedUserData.price = subscription_plan.plan_amount;
    updatedUserData.renew_date = subscription_plan.period_end_date;
    if (subscription_plan.name_plan == 'TEAMS') {
      updatedUserData.role = 'ADMIN';
    }
    this.localStorageService.saveJSON('user_settings', updatedUserData);
  }

  registerUser(body: registerRequest) {
    const headers = {
      'Content-Type': 'application/json',
      'no-auth': 'true',
      'no-token-refresh': 'true',
    };
    return this.httpService
      .post(`${this.configService.config.endpoints.register}`, body, headers)
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  exchangeCodeForTokens(code: string): Observable<any> {
    const url =
      'https://prod-agrobot-chat2dox.auth.eu-west-1.amazoncognito.com/oauth2/token';

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'no-auth': 'true',
    };

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'bs7g287gho70r6ri1i97udlfi',
      code: code,
      redirect_uri: 'https://agrobot.agroseguro.es/home',
    });

    return this.http
      .post(`${url}?${params.toString()}`, null, { headers })
      .pipe(
        map((res: any) => {
          this.parseAndStoreTokens(res);
          return res;
        })
      );
  }

  decodeToken(idToken: string | null) {
    try {
      if (idToken) {
        return jwtDecode(idToken);
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error);
    }
    return {};
  }

  parseAndStoreTokens(tokens: any) {
    if (!tokens || !tokens.id_token) {
      console.error('Invalid token response:', tokens);
      return;
    }

    const idToken = tokens.id_token;
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expiresIn = tokens.expires_in;
    // Decodificar y guardar tokens
    const userData: any = this.decodeToken(idToken);

    const user_settings = {
      isLogged: true,
      firstName: userData.given_name || '',
      email: userData.email || '',
      lastName: userData.family_name || '',
      role: userData.role || '',
      userStatus: userData.user_status || '',
      statusPlan: userData.status_plan || '',
      plan: userData.plan || '',
      language: (userData.language || '').toLowerCase(),
      tokensLimit: userData.tokens_limit || '',
      topic: userData.topic || [],
      admin: userData.admin || '',
      idToken,
      accessToken,
      refreshToken,
      expiresIn,
      expandLogo: userData.expand_logo || '',
      sidebarLogo: userData.sidebar_logo || '',
      renew_date: userData.period_end_date || '',
      price: userData.plan_amount || '',
      theme: 'light',
      credits: userData.credits || '',
      externalProvider: userData.external_provider || ''
    };


    this.setUserSettings(user_settings);

    this.userDataSubject.next({});
    this.router.navigate(['/home']);
  }
}
