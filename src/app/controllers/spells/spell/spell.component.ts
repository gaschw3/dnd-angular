import { Component, OnInit, Input } from '@angular/core';
import { Spell } from 'src/app/models/spell';

@Component({
  selector: 'app-spell',
  templateUrl: './spell.component.html',
  styleUrls: ['./spell.component.scss']
})
export class SpellComponent implements OnInit {

  @Input() spell: Spell;

  ccId: number = 0; //current class id

  constructor() {
  }

  ngOnInit() {
  }

  formatSpellLevel(lvl, school){
    if (lvl === 0)
      return school + " Cantrip";
    if (lvl === 1)
      return lvl + "st level " + school;
    if (lvl === 2)
      return lvl + "nd level " + school;
    if (lvl === 3)
      return lvl + "rd level " + school;
    else
      return lvl + "th level " + school;
  }
}
