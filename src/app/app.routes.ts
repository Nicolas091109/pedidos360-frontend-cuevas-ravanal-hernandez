import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { Home } from './paginas/home/home';
import { Pedidos } from './paginas/pedidos/pedidos';
import { Notificaciones } from './paginas/notificaciones/notificaciones';


export const routes: Routes = [
    { path: '', component: Home },  
    { path: 'pedidos', component: Pedidos, canActivate: [MsalGuard] },
    { path: 'notificaciones', component: Notificaciones, canActivate: [MsalGuard] },
    { path: '**', redirectTo: '' },
];
