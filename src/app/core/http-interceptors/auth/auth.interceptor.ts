import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from '../../services/users/user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private userService: UserService, private router: Router) {}

  //añade el header "Authorization" a la peticion
  setAuthHeader(headers: any) {

    return headers.set('Authorization', `${this.userService.idToken}`);

  }

  //Quita los header de validacion para generar la peticion
  removeExtraControlHeaders(headers: any) {
    if (headers.has('no-auth')) headers = headers.delete('no-auth');
    if (headers.has('no-token-refresh'))
      headers = headers.delete('no-token-refresh');
    return headers;
  }

  //Solicita una actualizacion de token de ser necesario

  updateRequestToken(request: any) {
    let body: any = request.body;
    if (body?.token) body.token = this.userService.idToken;
    return request.clone({ body: body });
  }

  //Intercepta una peticion para añadir validaciones genericas a las mismas, en este caso para añadir o no el token a la peticion
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let headers = request.headers;
    if (!headers.has('no-auth')) headers = this.setAuthHeader(headers);

    let noTokenRefresh = headers.has('no-token-refresh');
    headers = this.removeExtraControlHeaders(headers);

    return next.handle(request.clone({ headers: headers })).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!noTokenRefresh && error.status === 401)
          return this.userService.tokenRefresh().pipe(
            switchMap(() => {
              if (headers.has('Authorization'))
                headers = this.setAuthHeader(headers);
              request = this.updateRequestToken(request);
              return next.handle(request.clone({ headers: headers }));
            }),
            catchError((error: HttpErrorResponse) => {
             //Si falla la actualizacion del token se debe a que se vencio el refresh token y se debe hacer logout

              this.userService.logout();
              return throwError(() => error);
            })
          );
        return throwError(() => error);
      })
    );
  }
}
