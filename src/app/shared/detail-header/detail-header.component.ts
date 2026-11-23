import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-detail-header',
  templateUrl: './detail-header.component.html',
  styleUrls: ['./detail-header.component.scss']
})
export class DetailHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | undefined>(undefined);
  readonly source = input<string | undefined>(undefined);
  readonly strikethrough = input<boolean>(false);

  readonly sourceClass = computed(() => {
    const src = this.source();
    return src ? `color-${src.replace(/[+-]/g, '').toLowerCase()}` : '';
  });
}
