import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EpicBoonsComponent } from './epic-boons.component';

const routes: Routes = [
  { path: '', component: EpicBoonsComponent },
  {
    path: ':featName',
    component: EpicBoonsComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpicBoonsRoutingModule { }
