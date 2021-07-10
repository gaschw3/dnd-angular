import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PointBuyComponent } from './point-buy.component';

const routes: Routes = [
  { path: '', component: PointBuyComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PointBuyRoutingModule { }