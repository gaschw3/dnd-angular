import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Class } from 'src/app/models';

@Component({
  selector: 'app-level-table',
  templateUrl: './level-table.component.html',
  styleUrls: ['./level-table.component.scss']
})
export class LevelTableComponent implements OnInit {

  @Input() class: Class;
  @Output() talk: EventEmitter<string> = new EventEmitter<string>();

  private selected: Array<String> = ["beast"];

  constructor() { }

  ngOnInit() {
  }

  getFeatures(level) {
    return this.class.features.filter(f => f.level == level && f.subclass == "base");
  }

  shake(id: string){
    this.talk.emit(id);
  }

}
