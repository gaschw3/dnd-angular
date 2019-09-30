import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { ClassesRoutingModule } from './classes-routing.module';

import { ClassComponent } from './class/class.component';
import { ClassesComponent } from './classes.component';
import { FeaturesComponent } from './features/features.component';
import { LevelTableComponent } from './level-table/level-table.component';
import { LinkmakerPipe } from 'src/app/pipes/linkmaker.pipe';

@NgModule({
  declarations: [
    ClassComponent,
    ClassesComponent,
    FeaturesComponent,
    LevelTableComponent,
    LinkmakerPipe
  ],
  imports: [
    CommonModule,
    ClassesRoutingModule,
    DataTablesModule
  ]
})
export class ClassesModule { }
