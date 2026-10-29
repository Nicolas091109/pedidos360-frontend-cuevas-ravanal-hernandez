
import { Configuration, BrowserCacheLocation } from '@azure/msal-browser';

const TENANT_ID = '8d6f1b21-2f45-42ed-a451-025b1954fc47';
const CLIENT_ID = '238dfb81-d629-4f98-a61b-acaa009c3f47';

export const apiScope = 'api://d8ff5f57-bec7-4301-bfb0-d897468198de/access-all';

export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
  },
  cache: { cacheLocation: BrowserCacheLocation.LocalStorage },
};

export const loginRequest = { scopes: [apiScope] };

export const apiBaseUrl = 'http://localhost:8080/';