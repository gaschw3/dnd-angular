import { Component, computed, input } from '@angular/core';
import { SanitizeHtmlPipe } from 'src/app/pipes/sanitize-html.pipe';
import { sourceColorClass } from 'src/app/shared/helpers/format.utils';

@Component({
  imports: [SanitizeHtmlPipe],
  selector: 'app-detail-header',
  templateUrl: './detail-header.component.html',
  styleUrls: ['./detail-header.component.scss']
})
export class DetailHeaderComponent {
  readonly title = input.required<string>();
  readonly titleHtml = input<string | undefined>(undefined);
  readonly subtitle = input<string | undefined>(undefined);
  readonly source = input<string | undefined>(undefined);
  readonly strikethrough = input<boolean>(false);

  readonly sourceClass = computed(() => sourceColorClass(this.source()));
}
