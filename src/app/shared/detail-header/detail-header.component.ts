import { Component, computed, input } from '@angular/core';
import { LinkmakerPipe } from 'src/app/pipes/linkmaker.pipe';
import { SanitizeHtmlPipe } from 'src/app/pipes/sanitize-html.pipe';
import { ChangeBadgeComponent, ChangeType, normalizeChangeType } from 'src/app/shared/change-badge/change-badge.component';
import { sourceColorClass } from 'src/app/shared/helpers/format.utils';

@Component({
  imports: [LinkmakerPipe, SanitizeHtmlPipe, ChangeBadgeComponent],
  selector: 'app-detail-header',
  templateUrl: './detail-header.component.html',
  styleUrls: ['./detail-header.component.scss']
})
export class DetailHeaderComponent {
  readonly title = input.required<string>();
  readonly titleHtml = input<string | undefined>(undefined);
  readonly subtitle = input<string | undefined>(undefined);
  readonly source = input<string | undefined>(undefined);
  readonly change = input<ChangeType | string | undefined>(undefined);
  readonly changeNote = input<string | undefined>(undefined);
  readonly strikethrough = input<boolean>(false);

  readonly sourceClass = computed(() => sourceColorClass(this.source()));
  readonly normalizedChange = computed(() => normalizeChangeType(this.change()));
  readonly changeLabel = computed(() => {
    switch (this.normalizedChange()) {
      case 'buff':
        return 'House Rule (Buffed)';
      case 'nerf':
        return 'House Rule (Nerfed)';
      case 'change':
        return 'House Rule (Modified)';
      default:
        return 'House Rule';
    }
  });
}
