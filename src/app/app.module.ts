import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { HexmapComponent } from './controllers/hexmap/hexmap.component';
import { ClassesModule } from './controllers/classes/classes.module';
import { NgxScrollTopModule } from 'ngx-scrolltop';
import { ArchetypeFilterPipe } from './pipes/archetype-filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HexmapComponent,
    ArchetypeFilterPipe
  ],
  imports: [
    BrowserModule,
    DataTablesModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule,
    ClassesModule,
    NgxScrollTopModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
