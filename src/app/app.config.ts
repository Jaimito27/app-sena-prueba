import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngxs/store';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { AuthState } from './state/auth.state';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { UserState } from './state/user.state';
import { DocumentsState } from './state/document.state';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore([AuthState, UserState, DocumentsState],
      withNgxsReduxDevtoolsPlugin({
        disabled: !isDevMode()
      }),
      withNgxsLoggerPlugin({
        disabled: !isDevMode()
      }),
      withNgxsStoragePlugin({
        keys: ['auth'],
      }),
    ),
    provideHttpClient(withInterceptors([AuthInterceptor])), provideClientHydration(withEventReplay()),
  ]
};
