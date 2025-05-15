import { Injectable } from '@angular/core';
import { HttpService } from '../../http/http.service';
import { Observable, map } from 'rxjs';
import { UserService } from '../users/user.service';
import { topicRequest } from 'src/app/shared/models/topics/topics-request';
import { topicStatusRequest } from 'src/app/shared/models/topics/update-topic-request';
import { CreateUserRequest } from 'src/app/shared/models/users/create-users-request';
import { DeleteUserRequest } from 'src/app/shared/models/users/delete-users-request';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class UsersManagementService {
  topicsListEnable: string[] = [];

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private userService: UserService
  ) {

  }

  PostUserList(): Observable<any> { //Solicitud de la lista de usuarios registrados (teams)
    let body={"email":this.userService.email}

    const headers = {
      'Content-Type': 'application/json',

      };
      return this.httpService
        .get(
          `${this.configService.config.endpoints.get_users_list}/${this.userService.admin}`,
          body,
          headers
        )
        .pipe(
          map((res: any) => {
            return res;
          })
        );
    }

    GetTopic(): Observable<string[]> { //Solicitud de las listas de tópicos habilitados y deshabilitados

      const headers = {
        'Content-Type': 'application/json',
        'admin' : this.userService.role == 'ADMIN' ? this.userService.email : this.userService.admin //Si el rol no es admin se valida para saber a que tipo de usuario le esta obteniendo los datos

      };
      return this.httpService
        .get(
          `${this.configService.config.endpoints.get_topic}`,
          undefined,
          headers
        )
        .pipe(
          map((res: any) => {
            return res;
          })
        );
    }

    GetClientTopic(userEmail: string = ""): Observable<string[]> { // Solicitud de los tópicos de un usuario hijo desde el padre (teams)
      const headers = {
        'Content-Type': 'application/json',
        'admin' : this.userService.role == 'ADMIN' ? this.userService.email : this.userService.admin,
        'user': userEmail.length == 0 ? this.userService.email : userEmail, //sirve para validar si el admin esta viendo la informacion de un hijo
        'is_admin': this.userService.role == 'ADMIN' ? 'true' : 'false' //sirve para validar si el admin esta viendo la informacion de un hijo

      };
      return this.httpService
        .get(
          `${this.configService.config.endpoints.get_topic}`,
          undefined,
          headers
        )
        .pipe(
          map((res: any) => {
            return res;
          })
        );
    }

    PostNewTopics(body: topicRequest): Observable<any> { //Sirve para la creación de nuevos topicos
      const headers = {
        'Content-Type': 'application/json',

      };
      return this.httpService
        .post(
          `${this.configService.config.endpoints.new_topic}`,
          body,
          headers
        )
        .pipe(
          map((res: any) => {
            return res;
          })
        );
    }

    StatusTopics(body: topicStatusRequest): Observable<any> { // Para el cambio de estatus de los tópicos
      const headers = {
        'Content-Type': 'application/json',

      };
      return this.httpService
        .put(
          `${this.configService.config.endpoints.update_topic}`,
          body,
          headers
        )
        .pipe(
          map((res: any) => {
            return res;
          })
        );
    }

    PostNewUser(body: CreateUserRequest ): Observable<any> { // Para la creación de nuevos usuarios (admin)
      const headers = {
        'Content-Type': 'application/json'

      };
      return this.httpService
        .post(
          `${this.configService.config.endpoints.create_user}`,
          body,
          headers
        )
        .pipe(
          map((res: any) => {
            return res;
          })
        );
    }

    deleteUser(body: DeleteUserRequest): Observable<any> { // Para la eliminación de usuarios
      const headers = {
        'Content-Type': 'application/json',

      };
      return this.httpService
        .delete(
          `${this.configService.config.endpoints.delete_user}`,
          body,
          headers
        )
        .pipe(
          map((res: any) => {
            return res;
          })
        );
    }

}
