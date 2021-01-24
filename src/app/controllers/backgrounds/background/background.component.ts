import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

import { Subject } from 'rxjs';
import { Background } from 'src/app/models/background';

@Component({
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.css']
})
export class BackgroundComponent implements OnInit {

  @Input() background: Background;

  traitTables = ["Ideal", "Bond", "Flaw", "Personality Trait"];
  repeatedTraits = ["Skill Proficiencies", "Languages", "Tool Proficiencies", "Equipment"];

  ngOnInit() {}

  isUnique(trait) {
    if (this.repeatedTraits.includes(trait.name)) {
      return false;
    } else {
      return true;
    }
  }

  isTable(trait) {
    if (this.traitTables.includes(trait.name)) {
      return true;
    } else if (Boolean(trait.leadin)) {
      return true;
    } else {
      return false;
    }
  }
}
