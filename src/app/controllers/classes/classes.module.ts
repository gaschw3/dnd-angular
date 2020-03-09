import { NgModule } from '@angular/core';
import { ClassesRoutingModule } from './classes-routing.module';

import { ClassComponent } from './class/class.component';
import { ClassesComponent } from './classes.component';
import { FeaturesComponent } from './features/features.component';
import { LevelTableComponent } from './level-table/level-table.component';

import { ArchetypesComponent } from './archetypes/archetypes.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ClassComponent,
    ClassesComponent,
    FeaturesComponent,
    LevelTableComponent,
    ArchetypesComponent
  ],
  imports: [
    SharedModule,
    ClassesRoutingModule
  ]
})
export class ClassesModule { }
