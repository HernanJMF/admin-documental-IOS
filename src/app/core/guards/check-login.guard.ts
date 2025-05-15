import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/users/user.service';

@Injectable({
  providedIn: 'root',
})
export class CheckLoginGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    let isAuthenticated: boolean = this.userService.isAuthenticated;
    if (!isAuthenticated) {
      this.router.navigateByUrl('/login');
      return false;
    }
    return isAuthenticated;
  }
}
