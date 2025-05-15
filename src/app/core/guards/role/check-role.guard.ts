import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../../services/users/user.service';

@Injectable({
  providedIn: 'root',
})
export class CheckRoleGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  //Este guard valida que el usuario tenga un rol valido para acceder a la pantalla
  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    let isRole: any = this.userService.user_data;
    if (route.data['roles'].some((role) => role == isRole.role)) {
      return true;
    } else {
      this.router.navigate([`home`]);
      return false;
    }
  }
}
