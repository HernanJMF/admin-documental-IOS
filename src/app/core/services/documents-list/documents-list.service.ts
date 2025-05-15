import { Injectable } from '@angular/core';
import { HttpService } from '../../http/http.service';
import { EMPTY, Observable, ReplaySubject, catchError, map } from 'rxjs';
import { UserService } from '../users/user.service';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentsListService {
  public documentUploadData: any = {};

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private userService: UserService
    ) {

     }

  GetDocumentList(userEmail: string = ""): Observable<any> { //obtiene la lista de documentos
    const headers = {
      'Content-Type': 'application/json',
      'user_email': userEmail.length == 0 ? this.userService.email : userEmail, //valida si cargara la lista de un usuario hijo o del usuario actual
    };

    return this.httpService
      .get(
        `${this.configService.config.endpoints.get_document_list}`,
        undefined,
        headers
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  //Paso 1: Sube la información del documento y genera la url para subirlo
  PostDocumentUpload(body: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.httpService
      .post(
        `${this.configService.config.endpoints.document_upload}`,
        body, // Aquí se pasa el cuerpo de la solicitud
        headers
      )
      .pipe(
        map((res: any) => {
          return res
        })
      );
  }

  //paso 2: usa la url generada y el documento para subir el documento a S3
  PutDocument(url: string, blobFile: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
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
        }),
        catchError((err, caught) => {
          console.log(err)
          return EMPTY;
        })
      );
  }

  //Paso 3: carga el documento a pinecone
  PostDocumentPinecone(body: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'InvocationType': 'Event'
    };

    return this.httpService
      .post(
        `${this.configService.config.endpoints.document_upload_pinecone}`,
        body, // Aquí se pasa el cuerpo de la solicitud
        headers
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  //borra un documento
  deleteDocument(body: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json'
    };
    return this.httpService
      .delete(
        `${this.configService.config.endpoints.get_document_list}`,
        body,
        headers
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  //Edita la informacion de un documento
  editDocumentUploaded(body: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
    };
    return this.httpService
      .put(
        `${this.configService.config.endpoints.document_upload}`,
        body,
        headers
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  //obtiene la lista de documentos recientes
  GetRecentDocument(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'user_email': this.userService.username,
    };
    return this.httpService
      .get(
        `${this.configService.config.endpoints.get_recent_documents}`,
        undefined,
        headers
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }



}
