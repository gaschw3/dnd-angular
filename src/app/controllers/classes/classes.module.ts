import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { ClassesRoutingModule } from './classes-routing.module';

import { ClassComponent } from './class/class.component';
import { ClassesComponent } from './classes.component';

@NgModule({
  declarations: [
    ClassComponent,
    ClassesComponent
  ],
  imports: [
    CommonModule,
    ClassesRoutingModule,
    DataTablesModule
  ]
})
export class ClassesModule { }
