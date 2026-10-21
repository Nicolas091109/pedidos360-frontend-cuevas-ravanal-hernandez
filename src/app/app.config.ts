import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import {
  MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG,
  MsalService, MsalGuard, MsalBroadcastService, MsalInterceptor,
  MsalGuardConfiguration, MsalInterceptorConfiguration,
} from '@azure/msal-angular';
import { routes } from './app.routes';
import { msalConfig, loginRequest, apiScope, apiBaseUrl } from './auth-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
    { provide: MSAL_INSTANCE, useFactory: () => new PublicClientApplication(msalConfig) },
    {
      provide: MSAL_GUARD_CONFIG,
      useValue: { interactionType: InteractionType.Redirect, authRequest: loginRequest } as MsalGuardConfiguration,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([[apiBaseUrl + '*', [apiScope]]]),
      } as MsalInterceptorConfiguration,
    },
    MsalService, MsalGuard, MsalBroadcastService,

    provideAppInitializer(async () => {
      const msal = inject(MsalService);
      await msal.instance.initialize();
      const result = await msal.instance.handleRedirectPromise();
      if (result?.account) {
        msal.instance.setActiveAccount(result.account);
      } else if (!msal.instance.getActiveAccount()) {
        const accounts = msal.instance.getAllAccounts();
        if (accounts.length) msal.instance.setActiveAccount(accounts[0]);
      }
    }),
  ],
};
