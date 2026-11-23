import { Component, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { ClassFeature } from 'src/app/models/newClass';

@Component({
  standalone: false,
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
  @Input() features: ClassFeature[] = [];
  @Output() messageEvent = new EventEmitter<string>();

  public currActive = 'test';

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scroll = window.scrollY;
    const elements = document.querySelectorAll<HTMLElement>('.feature');
    for (const el of elements) {
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
