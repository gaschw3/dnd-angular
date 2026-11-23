import { Component, Input } from '@angular/core';
import { Spell } from 'src/app/models/spell';

@Component({
  standalone: false,
  selector: 'app-spell',
  templateUrl: './spell.component.html',
  styleUrls: ['./spell.component.scss']
})
export class SpellComponent {

  @Input() spell: Spell;

  ccId = 0; //current class id

  formatSpellLevel(lvl, schoolObj){
    const school = schoolObj.name;
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
