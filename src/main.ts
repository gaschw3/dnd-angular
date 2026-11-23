import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { RouteReuseStrategy, provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { SameComponentReuseStrategy } from './app/shared/same-component-reuse.strategy';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled' }),
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
    { provide: RouteReuseStrategy, useClass: SameComponentReuseStrategy }
  ]
}).catch(err => console.error(err));
