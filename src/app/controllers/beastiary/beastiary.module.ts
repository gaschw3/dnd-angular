import { NgModule } from '@angular/core';

import { BeastiaryRoutingModule } from './beastiary-routing.module';
import { BeastiaryComponent } from './beastiary.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MonsterComponent } from './monster/monster.component';

@NgModule({
  declarations: [
    BeastiaryComponent,
    MonsterComponent
  ],
  imports: [
    SharedModule,
    BeastiaryRoutingModule
  ]
})
export class BeastiaryModule { }
