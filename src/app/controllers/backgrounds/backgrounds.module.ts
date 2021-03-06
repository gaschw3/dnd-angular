import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { BackgroundsRoutingModule } from './backgrounds-routing.module';
import { BackgroundsComponent } from './backgrounds.component';
import { BackgroundComponent } from './background/background.component';

@NgModule({
  declarations: [
    BackgroundComponent,
    BackgroundsComponent
  ],
  imports: [
    SharedModule,
    BackgroundsRoutingModule
  ]
})
export class BackgroundsModule { }
