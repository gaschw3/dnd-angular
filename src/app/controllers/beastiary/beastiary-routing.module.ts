import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BeastiaryComponent } from './beastiary.component';


const routes: Routes = [
  { path: '', component: BeastiaryComponent },
  { 
    path: ':monsterName', 
    component: BeastiaryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BeastiaryRoutingModule { }
