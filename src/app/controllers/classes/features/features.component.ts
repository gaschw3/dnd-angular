import { Component, HostListener, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassFeature } from 'src/app/models/dnd-class';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';

@Component({
  imports: [CommonModule, EntryRendererComponent],
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
  readonly features = input<ClassFeature[]>([]);
  readonly currActive = signal<string>('');

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const offset = 115;
    const elements = document.querySelectorAll<HTMLElement>('.feature');
    let activeId = '';

    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= offset) {
        const id = el.getAttribute('id');
        if (id && !el.classList.contains('subsubclass')) {
          activeId = id;
        }
      } else {
        break;
      }
    }

    if (!activeId && elements.length > 0) {
      activeId = elements[0].getAttribute('id') || '';
    }

    if (activeId && this.currActive() !== activeId) {
      this.currActive.set(activeId);
    }
  }
}
