import { Component, OnInit, OnChanges, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

import { Class, Proficiency, Multiclass } from '../../../models';
import { FeaturesComponent } from '../features/features.component';
import { ArchetypesComponent } from '../archetypes/archetypes.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss']
})
export class ClassComponent implements OnInit, OnChanges {

  @Input() class: Class;
  @ViewChild(FeaturesComponent) child: FeaturesComponent;
  @ViewChild(ArchetypesComponent) child2: ArchetypesComponent;
  @Output() talk: EventEmitter<string> = new EventEmitter<string>();

  archetypeChange: Subject<Array<String>> = new Subject<Array<String>>();
  selectedChange: Subject<boolean> = new Subject<boolean>();

  prof: Proficiency;
  multi: Multiclass;
  selectedArchetypes: Array<String> = [];
  allSelected: boolean = true;
  ccId: number = 0; //current class id

  constructor() {
    this.archetypeChange.subscribe((value) => {
      this.selectedArchetypes = value
    });
    this.selectedChange.subscribe((value) => {
      this.allSelected = value
    });
  }

  ngOnInit() {
    this.prof = this.class.proficiencies;
    this.multi = this.class.multiclassing;
  }

  ngOnChanges() {
    this.prof = this.class.proficiencies;
    this.multi = this.class.multiclassing;
  }

  getFilteredFeatures() {
    if (this.selectedArchetypes.length == 0 && this.allSelected) {
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
