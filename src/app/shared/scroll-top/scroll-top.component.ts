import { Component, HostListener } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-scroll-top',
  imports: [FaIconComponent],
  template: `
    @if (visible) {
      <button
        type="button"
        class="scrolltop-button"
        (click)="scrollToTop()"
        aria-label="Scroll to top"
        title="Back to top"
        >
        <fa-icon [icon]="faChevronUp" aria-hidden="true" />
      </button>
    }
    `,
  styles: [`
    .scrolltop-button {
      position: fixed;
      right: 1.25rem;
      bottom: 1.25rem;
      z-index: 1030;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      border: none;
      background-color: var(--theme-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      transition: transform 0.15s ease, opacity 0.2s ease;
    }
    .scrolltop-button:hover {
      transform: translateY(-2px);
    }
  `]
})
export class ScrollTopComponent {
  readonly faChevronUp = faChevronUp;
  visible = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible = window.scrollY > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
