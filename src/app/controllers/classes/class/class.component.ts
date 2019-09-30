import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { Subject, Observable } from "rxjs";

import { Class, Proficiency } from '../../../models';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.css']
})
export class ClassComponent implements OnInit {
  
  @Input() class: Class;
  prof: Proficiency;

  ccId: number = 0; //current class id

  constructor() {}

  ngOnInit() {
    this.prof = this.class.proficiencies;
   }
}
