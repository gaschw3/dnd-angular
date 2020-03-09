import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpellsComponent } from './spells.component';


const routes: Routes = [
  { path: '', component: SpellsComponent },
  { 
    path: ':spellName', 
    component: SpellsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpellsRoutingModule { }
