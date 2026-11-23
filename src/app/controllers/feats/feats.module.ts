import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { FeatsRoutingModule } from './feats-routing.module';
import { FeatsComponent } from './feats.component';

@NgModule({
  declarations: [
    FeatsComponent
  ],
  imports: [
    SharedModule,
    FeatsRoutingModule
  ]
})
export class FeatsModule { }
