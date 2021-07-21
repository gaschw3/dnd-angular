import { MonsterComponent } from './../controllers/beastiary/monster/monster.component';
import { MonsterHelperService } from './helpers/monster/monster-helper.service';
import { AncestryComponent } from './../controllers/ancestries/ancestry/ancestry.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { ArchetypeFilterPipe } from '../pipes/archetype-filter.pipe';
import { LinkmakerPipe } from '../pipes/linkmaker.pipe';
import { SanitizeHtmlPipe } from '../pipes/sanitize-html.pipe';
import { BackButtonDirective } from '../directives/back-button.directive';
import { ItemTypePipe } from '../pipes/item-type.pipe';
import { OrdinalPipe } from '../pipes/ordinal.pipe';
import { EntryRendererComponent } from './entry-renderer/entry-renderer.component';
import { HelperService } from './helpers/helper.service';

@NgModule({
  providers: [
    HelperService,
    MonsterHelperService
  ],
  declarations: [
    ArchetypeFilterPipe,
    LinkmakerPipe,
    SanitizeHtmlPipe,
    ItemTypePipe,
    BackButtonDirective,
    OrdinalPipe,
    AncestryComponent,
    MonsterComponent,
    EntryRendererComponent
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
    BackButtonDirective,
    AncestryComponent,
    MonsterComponent,
    EntryRendererComponent
  ]
})
export class SharedModule { }
