import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { loginRequest } from './auth-config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private msal = inject(MsalService);

  get account() {
    return this.msal.instance.getActiveAccount();
  }

  login() {
    this.msal.instance.loginRedirect(loginRequest);
  }

  logout() {
    this.msal.instance.logoutRedirect({ account: this.account });
  }
}