import { ViewportScroller } from '@angular/common';
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

  constructor(private viewport: ViewportScroller) {
    this.viewport.setOffset([0, 80]);
  }

  ngOnInit() {
  }

  getFeatures(level) {
    return this.class.classFeature.filter(f => f.level == level);
  }

  shake(id: string){
    this.viewport.setOffset(() => [50, 80]);
    this.viewport.scrollToAnchor(id);
    this.talk.emit(id);
  }

}
