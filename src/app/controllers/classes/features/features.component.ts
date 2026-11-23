import { Component, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassFeature } from 'src/app/models/newClass';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';

@Component({
  imports: [CommonModule, EntryRendererComponent],
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
