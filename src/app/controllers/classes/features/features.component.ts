import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { ClassFeature } from 'src/app/models/newClass';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit {
  @Input() features: ClassFeature[] = [];
  @Output() messageEvent = new EventEmitter<string>();

  public currActive = 'test';

  constructor() {}

  ngOnInit(): void {}

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scroll = window.scrollY;
    const elements = document.querySelectorAll<HTMLElement>('.feature');
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const offsetTop = el.getBoundingClientRect().top + window.scrollY;
      if (offsetTop >= scroll) {
        const id = el.getAttribute('id');
        if (id && this.currActive !== id && !el.classList.contains('subclass') && !el.classList.contains('archetype')) {
          this.currActive = id;
        }
        break;
      }
    }
  }
}
