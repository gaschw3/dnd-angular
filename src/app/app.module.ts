import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { HexmapComponent } from './controllers/hexmap/hexmap.component';
import { ClassesModule } from './controllers/classes/classes.module';
import { SpellsModule } from './controllers/spells/spells.module';
import { BeastiaryModule } from './controllers/beastiary/beastiary.module';
import { BackgroundsModule } from './controllers/backgrounds/backgrounds.module';
import { AncestriesModule } from './controllers/ancestries/ancestries.module';
import { PointBuyModule } from './controllers/point-buy/point-buy.module';
import { SharedModule } from './shared/shared.module';

import { NgxScrollTopModule } from 'ngx-scrolltop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParticlesComponent } from './controllers/particles/particles.component';

@NgModule({
  declarations: [
    AppComponent,
    HexmapComponent,
    ParticlesComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    ClassesModule,
    SpellsModule,
    BeastiaryModule,
    BackgroundsModule,
    AncestriesModule,
    PointBuyModule,
    NgxScrollTopModule
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
