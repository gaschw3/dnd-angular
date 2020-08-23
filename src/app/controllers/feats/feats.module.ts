import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { FeatsRoutingModule } from './feats-routing.module';
import { FeatsComponent } from './feats.component';
import { FeatComponent } from './feat/feat.component';

@NgModule({
  declarations: [
    FeatComponent,
    FeatsComponent
  ],
  imports: [
    SharedModule,
    FeatsRoutingModule
  ]
})
export class FeatsModule { }
