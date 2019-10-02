import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

import { Class, Proficiency } from '../../../models';
import { FeaturesComponent } from '../features/features.component';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.css']
})
export class ClassComponent implements OnInit {
  
  @Input() class: Class;
  @ViewChild(FeaturesComponent, {static: false}) child: FeaturesComponent;
  @Output() talk: EventEmitter<string> = new EventEmitter<string>();
  prof: Proficiency;

  ccId: number = 0; //current class id

  constructor() {}

  ngOnInit() {
    this.prof = this.class.proficiencies;
   }

   shake(id: string){
    this.talk.emit(id);
  }
}
