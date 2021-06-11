import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { ArchetypeFilterPipe } from '../pipes/archetype-filter.pipe';
import { LinkmakerPipe } from '../pipes/linkmaker.pipe';
import { SanitizeHtmlPipe } from '../pipes/sanitize-html.pipe';
import { BackButtonDirective } from '../directives/back-button.directive';
import { ItemTypePipe } from '../pipes/item-type.pipe';
import { OrdinalPipe } from '../pipes/ordinal.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ArchetypeFilterPipe,
    LinkmakerPipe,
    SanitizeHtmlPipe,
    ItemTypePipe,
    BackButtonDirective,
    OrdinalPipe
  ],
  imports: [
    CommonModule,
    DataTablesModule
  ],
  exports: [
    CommonModule,
    DataTablesModule,
    ArchetypeFilterPipe,
    LinkmakerPipe,
    SanitizeHtmlPipe,
    ItemTypePipe,
    BackButtonDirective
  ]
})
export class SharedModule { }
