import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { newClass } from 'src/app/models';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'app-level-table',
  templateUrl: './level-table.component.html',
  styleUrls: ['./level-table.component.scss']
})
export class LevelTableComponent {

  @Input() dndClass: newClass;
  get class(): newClass {
    return this.dndClass;
  }
  @Output() talk: EventEmitter<string> = new EventEmitter<string>();

  private viewport = inject(ViewportScroller);

  constructor() {
    this.viewport.setOffset([0, 80]);
  }

  getFeatures(level: number) {
    return this.class.classFeature.filter(f => f.level == level);
  }

  shake(id: string){
    this.viewport.setOffset(() => [50, 80]);
    this.viewport.scrollToAnchor(id);
    this.talk.emit(id);
  }

}
