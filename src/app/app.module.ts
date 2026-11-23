import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { SharedModule } from './shared/shared.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParticlesComponent } from './controllers/particles/particles.component';
import { NotFoundComponent } from './error/not-found/not-found.component';
import { ServerErrorComponent } from './error/server-error/server-error.component';
import { ScrollTopComponent } from './shared/scroll-top/scroll-top.component';
import { QuickSearchComponent } from './shared/quick-search/quick-search.component';
import { BookmarksTrayComponent } from './shared/bookmarks-tray/bookmarks-tray.component';

@NgModule({
  declarations: [
    AppComponent,
    ParticlesComponent,
    NotFoundComponent,
    ServerErrorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    ScrollTopComponent,
    QuickSearchComponent,
    BookmarksTrayComponent
  ],
  exports: [],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent]
})

export class AppModule { }
