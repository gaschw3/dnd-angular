import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { newClass } from 'src/app/models';

@Component({
  selector: 'app-level-table',
  templateUrl: './level-table.component.html',
  styleUrls: ['./level-table.component.scss']
})
export class LevelTableComponent implements OnInit {

  @Input() class: newClass;
  @Output() talk: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  getFeatures(level) {
    return this.class.classFeature.filter(f => f.level == level);
  }

  shake(id: string){
    this.talk.emit(id);
  }

}
