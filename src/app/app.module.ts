import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParticlesComponent } from './controllers/particles/particles.component';
import { EncounterBuilderComponent } from './controllers/encounter-builder/encounter-builder.component';
import { NotFoundComponent } from './error/not-found/not-found.component';
import { ServerErrorComponent } from './error/server-error/server-error.component';
import { OtherFeaturesModule } from './controllers/other-features/other-features.module';
import { SpellbookComponent } from './controllers/spellbook/spellbook.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NameGenComponent } from './controllers/name-gen/name-gen.component';

@NgModule({
  declarations: [
    AppComponent,
    HexmapComponent,
    ParticlesComponent,
    EncounterBuilderComponent,
    NotFoundComponent,
    ServerErrorComponent,
    SpellbookComponent,
    NameGenComponent
  ],
  imports: [
    BrowserModule,
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
    OtherFeaturesModule,
    NgxScrollTopModule,
    NgxSliderModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
