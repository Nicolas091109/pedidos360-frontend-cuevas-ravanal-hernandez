import { Component, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-panel',
  imports: [],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel {

  private msal = inject(MsalService);

  account =
    this.msal.instance.getActiveAccount() ??
    this.msal.instance.getAllAccounts()[0] ??
    null;

  get nombreUsuario(): string {
    return this.account?.name ?? 'Operador';
  }

  get correoUsuario(): string {
    return this.account?.username ?? '';
  }
}