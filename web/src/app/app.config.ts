import { provideHttpClient, withFetch } from '@angular/common/http';
import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import Aura from '@primeuix/themes/aura';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideTanStackQuery(new QueryClient()),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          // Light theme only; dark mode would only apply if this class were added.
          darkModeSelector: '.app-dark',
          // Put PrimeNG styles in a layer below Tailwind utilities so utilities can override them.
          cssLayer: { name: 'primeng', order: 'theme, base, primeng' },
        },
      },
    }),
    MessageService,
  ],
};
