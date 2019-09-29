import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { ClassesRoutingModule } from './classes-routing.module';

import { ClassComponent } from './class/class.component';
import { ClassesComponent } from './classes.component';
import { FeaturesComponent } from './features/features.component';
import { LevelTableComponent } from './level-table/level-table.component';

@NgModule({
  declarations: [
    ClassComponent,
    ClassesComponent,
    FeaturesComponent,
    LevelTableComponent
  ],
  imports: [
    CommonModule,
    ClassesRoutingModule,
    DataTablesModule
  ]
})
export class ClassesModule { }
