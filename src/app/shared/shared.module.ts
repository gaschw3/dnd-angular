import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { ArchetypeFilterPipe } from '../pipes/archetype-filter.pipe';
import { LinkmakerPipe } from '../pipes/linkmaker.pipe';
import { SanitizeHtmlPipe } from '../pipes/sanitize-html.pipe';
import { BackButtonDirective } from '../directives/back-button.directive';

@NgModule({
  declarations: [
    ArchetypeFilterPipe,
    LinkmakerPipe,
    SanitizeHtmlPipe,
    BackButtonDirective
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
    BackButtonDirective
  ]
})
export class SharedModule { }
