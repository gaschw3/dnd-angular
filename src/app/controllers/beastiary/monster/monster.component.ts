import { MonsterHelperService } from '../../../shared/helpers/monster/monster-helper.service';
import { HelperService } from './../../../shared/helpers/helper.service';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Monster } from 'src/app/models/monster';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';
import { LinkmakerPipe } from 'src/app/pipes/linkmaker.pipe';
import { TitlecaseExceptPipe } from 'src/app/pipes/titlecase-except.pipe';


@Component({
  imports: [CommonModule, EntryRendererComponent, LinkmakerPipe, TitlecaseExceptPipe],
  selector: 'app-monster',
  templateUrl: './monster.component.html',
  styleUrls: ['./monster.component.scss']
})
export class MonsterComponent {

  @Input() monster: Monster;

  constructor(
    public helper: HelperService,
    public monsterService: MonsterHelperService
  ) { }

  isObject(val: unknown): boolean { return typeof val === 'object'; }
}
