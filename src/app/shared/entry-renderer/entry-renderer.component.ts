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
    //data isn't super clean, an "item" should only have an "entry":string, but very occasionally, one slips through that uses "entries":[] where the array is just one string - handle that case
    if (entry.entries) {
      return '<strong>' + entry.name + '</strong> ' + entry.entries.join('\n');
    }
    return '<strong>' + entry.name + '</strong> ' + entry.entry;
  }
}
