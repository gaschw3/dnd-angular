import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AncestriesComponent } from './ancestries.component';

const routes: Routes = [
  { path: '', component: AncestriesComponent },
  { 
    path: ':ancestryName', 
    component: AncestriesComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AncestriesRoutingModule { }
