import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OtherFeaturesComponent } from './other-features.component';
import { FeatureComponent } from './feature/feature.component';

const routes: Routes = [
  { path: '', component: OtherFeaturesComponent },
  {
    path: ':feature',
    component: OtherFeaturesComponent
  },
  {
    path: ':type/:feature',
    component: OtherFeaturesComponent
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
})
export class OtherFeaturesRoutingModule { }
