import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { AncestriesRoutingModule } from './ancestries-routing.module';
import { AncestriesComponent } from './ancestries.component';

@NgModule({
  declarations: [
    AncestriesComponent
  ],
  imports: [
    SharedModule,
    AncestriesRoutingModule
  ]
})
export class AncestriesModule { }
