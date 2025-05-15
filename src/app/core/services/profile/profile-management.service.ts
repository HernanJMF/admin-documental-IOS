import { EventEmitter, Injectable, Output } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';
import { HttpService } from '../../http/http.service';
import { UserService } from '../users/user.service';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementService {

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private userService: UserService
    ) {

    }

  PatchProfile(body: any): Observable<any> { //Actualiza la informacion personal del usuario
      const headers = {
        'Content-Type': 'application/json',
      };
      return this.httpService
        .put(
          `${this.configService.config.endpoints.update_profile}`,
          body,
          headers
        )
        .pipe(
          map((res: any) => {
            if(body.language){
              this.userService.updateLanguage(body);
            }
            return res;
          })
        );
    }

  PatchPassword(newP,lastP,token): Observable<any> { //Actualiza la contraseña del usuario

    let body={
      "previous_password": lastP,
      "proposed_password": newP,
      "access_token": token
    } 
    const headers = {
      'Content-Type': 'application/json',

    };
    return this.httpService
      .post(
        `${this.configService.config.endpoints.update_password}`,
        body,
        headers
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  getLogosURL(expandLogo: string, sidebarLogo: string, isExpanded: boolean, isReduced: boolean): Observable<any> {
    //obtiene las url para subir los logos
    let headers = {};
    if(isExpanded && isReduced){
      headers = {
        'Content-Type': 'application/json',
        "user": this.userService.admin,
        "sidebar_logo": sidebarLogo,
        "expand_logo": expandLogo
      };
    }else if(isExpanded && !isReduced){
      headers = {
        'Content-Type': 'application/json',
        "user": this.userService.admin,
        "expand_logo": expandLogo
      };
    }else if(!isExpanded && isReduced){
      headers = {
        'Content-Type': 'application/json',
        "user": this.userService.admin,
        "sidebar_logo": sidebarLogo
      };
    }
    return this.httpService
      .get(
        `${this.configService.config.endpoints.update_logos}`,
        undefined,
        headers
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  PutImage(url: string, blobFile: any, type: any): Observable<any> { //sube los logos con la url generada
    const headers = {
      'Content-Type': type,
      'no-auth': 'true', 
      'no-token-refresh': 'true',
    };
    return this.httpService
      .putFile(
        url,
        blobFile,
        headers
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }
  
}
