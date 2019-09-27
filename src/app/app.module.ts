import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { HexmapComponent } from './controllers/hexmap/hexmap.component';

@NgModule({
  declarations: [
    AppComponent,
    HexmapComponent,
  ],
  imports: [
    BrowserModule,
    DataTablesModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
