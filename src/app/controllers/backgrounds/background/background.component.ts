import { Component, Input } from '@angular/core';

import { Background } from 'src/app/models/background';

@Component({
  standalone: false,
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent {

  @Input() background: Background;

  traitTables = ["Ideal", "Bond", "Flaw", "Personality Trait"];
  repeatedTraits = ["Skill Proficiencies", "Languages", "Tool Proficiencies", "Equipment"];

  isUnique(trait: any): boolean {
    if (this.repeatedTraits.includes(trait.name)) {
      return false;
    } else {
      return true;
    }
  }

  isTable(trait: any): boolean {
    if (this.traitTables.includes(trait.name)) {
      return true;
    } else if (trait.leadin) {
      return true;
    } else {
      return false;
    }
  }
}
