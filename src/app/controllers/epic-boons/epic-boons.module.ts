import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { EpicBoonsRoutingModule } from './epic-boons-routing.module';
import { EpicBoonsComponent } from './epic-boons.component';

@NgModule({
  declarations: [
    EpicBoonsComponent
  ],
  imports: [
    SharedModule,
    EpicBoonsRoutingModule
  ]
})
export class EpicBoonsModule { }
