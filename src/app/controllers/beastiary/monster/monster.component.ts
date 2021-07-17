import { MonsterHelperService } from './../../../shared/helpers/monster-helper.service';
import { HelperService } from './../../../shared/helpers/helper.service';
import { Component, Input } from '@angular/core';
import { Monster } from 'src/app/models/monster';
import { sizeMap } from 'src/app/shared/sizeMap';
import { alignmentMap } from 'src/app/shared/alignmentMap';


@Component({
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

  isObject(val): boolean { return typeof val === 'object'; }
}
