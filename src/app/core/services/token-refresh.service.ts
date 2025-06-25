import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Store } from '@ngxs/store';
import { interval, Subscription } from 'rxjs';
import { AuthState, Logout, SetUser } from '../../state/auth.state';

@Injectable({
  providedIn: 'root'
})
export class TokenRefreshService {
private store = inject(Store);
private authService = inject(AuthService);
private refreshInterval?: Subscription;

startAutoRefresh(){
  this.stopAutoRefresh();

  this.refreshInterval = interval(60 * 1000).subscribe(() => {
    const expiresAt = this.store.selectSnapshot(AuthState.expiresAt);
    const user = this.store.selectSnapshot(AuthState.currentUser)
    const token = this.store.selectSnapshot(AuthState.token)
    if(!expiresAt || !user || !token) return;

const msToExpire = expiresAt - Date.now();
if(msToExpire < 5 * 60 * 1000 && msToExpire > 0){//faltan menos de 5 mins
this.authService.renewToken(token).subscribe({
  next: ({token: newToken, expiresAt: newExpiresAt}) => {
    this.store.dispatch(new SetUser(user, newToken, newExpiresAt));
  },
  error: () => {
    this.store.dispatch(new Logout());
  }
});
}
if(msToExpire <= 0){
  this.store.dispatch(new Logout());
}

  });

}

private stopAutoRefresh(){
  this.refreshInterval?.unsubscribe();
  this.refreshInterval = undefined;
}
  constructor() { }
}
