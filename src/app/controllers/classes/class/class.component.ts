import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

import { Class, Proficiency } from '../../../models';
import { FeaturesComponent } from '../features/features.component';
import { ArchetypesComponent } from '../archetypes/archetypes.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.css']
})
export class ClassComponent implements OnInit {

  @Input() class: Class;
  @ViewChild(FeaturesComponent, {static: false}) child: FeaturesComponent;
  @ViewChild(ArchetypesComponent, {static: false}) child2: ArchetypesComponent;
  @Output() talk: EventEmitter<string> = new EventEmitter<string>();

  archetypeChange: Subject<Array<String>> = new Subject<Array<String>>();

  prof: Proficiency;
  selectedArchetypes: Array<String> = [];
  ccId: number = 0; //current class id

  constructor() {
    this.archetypeChange.subscribe((value) => {
      this.selectedArchetypes = value
    });
  }

  ngOnInit() {
    this.prof = this.class.proficiencies;
  }

  getFilteredFeatures() {
    if (this.selectedArchetypes.length == 0) {
      return this.class.features
    } else {
      return this.class.features.filter(f => f.subclass == "base" || this.selectedArchetypes.includes(f.subclass));
    }
  }

  getArchetypes() {
    return this.class.features.filter(f => f.filter == "yes").sort(function(a, b) {
      return (a.name < b.name) ? -1 : 1;
    });
  }

  shake(id: string){
    this.talk.emit(id);
  }
}
