import { Component, OnInit, OnChanges, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { newClass, newMulticlass, Proficiencies} from '../../../models';
import { FeaturesComponent } from '../features/features.component';
import { ArchetypesComponent } from '../archetypes/archetypes.component';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';
import { LinkmakerPipe } from 'src/app/pipes/linkmaker.pipe';
import { Subject } from 'rxjs';

@Component({
  imports: [CommonModule, RouterModule, EntryRendererComponent, ArchetypesComponent, FeaturesComponent, LinkmakerPipe],
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss']
})
export class ClassComponent implements OnInit, OnChanges {

  @Input() dndClass: newClass;
  get class(): newClass {
    return this.dndClass;
  }
  @ViewChild(FeaturesComponent) child: FeaturesComponent;
  @ViewChild(ArchetypesComponent) child2: ArchetypesComponent;
  @Output() talk: EventEmitter<string> = new EventEmitter<string>();

  archetypeChange: Subject<string[]> = new Subject<string[]>();
  selectedChange: Subject<boolean> = new Subject<boolean>();

  prof: Proficiencies;
  multi: newMulticlass;
  selectedArchetypes: string[] = [];
  allSelected = false;
  ccId = 0; //current class id

  constructor() {
    this.archetypeChange.subscribe((value) => {
      this.selectedArchetypes = value
    });
    this.selectedChange.subscribe((value) => {
      this.allSelected = value
    });
  }

  ngOnInit() {
    this.prof = this.class.startingProficiencies;
    this.multi = this.class.multiclassing;
  }

  ngOnChanges() {
    this.prof = this.class.startingProficiencies;
    this.multi = this.class.multiclassing;
  }

  getFilteredFeatures() {
    if (this.selectedArchetypes.length == 0 && this.allSelected) {
      return this.class.classFeature.concat(this.class.subclassFeature)
      .sort((a,b) =>
          (a.level < b.level) ? -1 : 1
      );
    } else {
      return this.class.classFeature.concat(this.class.subclassFeature.filter(f => this.selectedArchetypes.includes(f.subclassShortName)))
      .sort((a,b) => 
        (a.level < b.level) ? -1 : 1
      );
    }
  }

  getArchetypes() {
    return this.class.subclass.sort(function(a, b) {
      return (a.name < b.name) ? -1 : 1;
    });
  }

  shake(id: string){
    this.talk.emit(id);
  }
}
