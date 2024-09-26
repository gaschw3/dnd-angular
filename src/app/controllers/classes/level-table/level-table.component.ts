import { ViewportScroller } from '@angular/common';
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

  constructor(private viewport: ViewportScroller) {
    this.viewport.setOffset([0, 80]);
  }

  ngOnInit() {
  }

  getFeatures(level) {
    return this.class.features.filter(f => f.level == level && f.subclass == "base");
  }

  shake(id: string){
    this.viewport.setOffset(() => [50, 80]);
    this.viewport.scrollToAnchor(id);
    this.talk.emit(id);
  }

}
