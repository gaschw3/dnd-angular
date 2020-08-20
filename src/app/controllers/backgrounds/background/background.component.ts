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
  @Output() talk: EventEmitter<string> = new EventEmitter<string>();

  archetypeChange: Subject<Array<String>> = new Subject<Array<String>>();

  selectedArchetypes: Array<String> = [];
  ccId: number = 0; //current class id

  constructor() {
    this.archetypeChange.subscribe((value) => {
      this.selectedArchetypes = value
    });
  }

  ngOnInit() {}
}
