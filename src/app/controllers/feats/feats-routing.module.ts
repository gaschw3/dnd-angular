import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeatsComponent } from './feats.component';

const routes: Routes = [
  { path: '', component: FeatsComponent },
  {
    path: ':featName',
    component: FeatsComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeatsRoutingModule { }
