import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngxs/store';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore([],
      withNgxsReduxDevtoolsPlugin({
        disabled: !isDevMode()
      }),
      withNgxsLoggerPlugin({
        disabled: !isDevMode()
      }),
      withNgxsStoragePlugin({
        keys: ['auth.token', 'auth.user'],
      })
    )
  ]
};
