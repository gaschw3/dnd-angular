import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { LinkmakerPipe } from '../../pipes/linkmaker.pipe';
import { SanitizeHtmlPipe } from '../../pipes/sanitize-html.pipe';

const KNOWN_ENTRY_TYPES = new Set(['list', 'table', 'item', 'entries', 'column', 'inset']);

@Component({
  imports: [LinkmakerPipe, SanitizeHtmlPipe],
  selector: 'app-entry-renderer',
  templateUrl: './entry-renderer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryRendererComponent {
  readonly parent = input<string>('');
  readonly list = input<any[] | undefined>(undefined);

  getEntryType(entry: any): string {
    if (!entry?.type) {
      return '';
    }
    return KNOWN_ENTRY_TYPES.has(entry.type) ? entry.type : 'undef';
  }

  getListItemHtml(entry: any): string {
    return '<strong>' + this.formatItemName(entry.name) + '</strong> ' + (entry.entry ?? '');
  }

  formatItemName(name: string | undefined): string {
    if (!name) {
      return '';
    }
    const trimmed = name.trim();
    return /[:.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  }
}
