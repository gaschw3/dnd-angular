import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { FeatureComponent } from './feature/feature.component';
import { OtherFeaturesComponent } from './other-features.component';
import { OtherFeaturesRoutingModule } from './other-featuers-routing.module';

@NgModule({
  declarations: [
    FeatureComponent,
    OtherFeaturesComponent
  ],
  imports: [
    SharedModule,
    OtherFeaturesRoutingModule
  ]
})
export class OtherFeaturesModule { }
