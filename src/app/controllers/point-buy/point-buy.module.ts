import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { PointBuyComponent } from './point-buy.component';
import { PointBuyRoutingModule } from './point-buy-routing.module';
import { AncestryComponent } from '../ancestries/ancestry/ancestry.component';

@NgModule({
  declarations: [
    PointBuyComponent
],
imports: [
    PointBuyRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class PointBuyModule { }
