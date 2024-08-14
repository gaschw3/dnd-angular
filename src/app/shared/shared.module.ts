import { MonsterComponent } from './../controllers/beastiary/monster/monster.component';
import { MonsterHelperService } from './helpers/monster/monster-helper.service';
import { AncestryComponent } from './../controllers/ancestries/ancestry/ancestry.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { LinkmakerPipe } from '../pipes/linkmaker.pipe';
import { SanitizeHtmlPipe } from '../pipes/sanitize-html.pipe';
import { ItemTypePipe } from '../pipes/item-type.pipe';
import { TitlecaseExceptPipe } from '../pipes/titlecase-except.pipe';
import { BackButtonDirective } from '../directives/back-button.directive';
import { EntryRendererComponent } from './entry-renderer/entry-renderer.component';
import { HelperService } from './helpers/helper.service';
import { IdToNamePipe } from '../pipes/id-to-name.pipe';

@NgModule({
  providers: [
    HelperService,
    MonsterHelperService
  ],
  declarations: [
    LinkmakerPipe,
    SanitizeHtmlPipe,
    ItemTypePipe,
    TitlecaseExceptPipe,
    BackButtonDirective,
    AncestryComponent,
    MonsterComponent,
    EntryRendererComponent,
    IdToNamePipe
  ],
  imports: [
    CommonModule,
    DataTablesModule
  ],
  exports: [
    CommonModule,
    DataTablesModule,
    LinkmakerPipe,
    SanitizeHtmlPipe,
    ItemTypePipe,
    TitlecaseExceptPipe,
    BackButtonDirective,
    AncestryComponent,
    MonsterComponent,
    EntryRendererComponent,
    IdToNamePipe
  ]
})
export class SharedModule { }
