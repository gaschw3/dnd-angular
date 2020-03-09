import { NgModule } from '@angular/core';

import { SpellsRoutingModule } from './spells-routing.module';
import { SpellsComponent } from './spells.component';
import { SpellComponent } from './spell/spell.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    SpellsComponent,
    SpellComponent
  ],
  imports: [
    SharedModule,
    SpellsRoutingModule
  ]
})
export class SpellsModule { }
