import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { Panel } from './panel/panel';
import { Home } from './paginas/home/home';


export const routes: Routes = [
    { path: '', component: Home },  
    { path: 'panel', component: Panel, canActivate: [MsalGuard] },
    { path: '**', redirectTo: '' },
];
