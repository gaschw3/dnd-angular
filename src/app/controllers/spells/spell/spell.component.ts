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

  formatSpellLevel(lvl: number | string, schoolObj: { name: string }): string {
    const level = Number(lvl);
    const school = schoolObj.name;
    if (level === 0)
      return school + " Cantrip";
    if (level === 1)
      return level + "st level " + school;
    if (level === 2)
      return level + "nd level " + school;
    if (level === 3)
      return level + "rd level " + school;
    else
      return level + "th level " + school;
  }
}
