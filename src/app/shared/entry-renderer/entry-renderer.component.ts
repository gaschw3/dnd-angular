import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'entry-renderer',
  templateUrl: './entry-renderer.component.html',
  styleUrls: ['./entry-renderer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryRendererComponent implements OnInit {

  @Input() parent: any;
  @Input() list: any;

  constructor() { }

  ngOnInit(): void {
  }

  isSimpleList(items): boolean {
    if (typeof items[0] === 'string') {
      return true;
    } else {
      return false;
    }
  }

  getEntryType(entry): string {
    if (entry.type) {
      if (entry.type == "list") {
        return "list";
      } else if (entry.type == "table") {
        return "table";
      } else if (entry.type == "item") {
        return "item";
      } else if (entry.type == "entries") {
        return "entries";
      }
    } else {
      return "";
    }
  }

  getListItemHtml(entry): string {
    return '<strong>'+entry.name+'</strong> '+entry.entry;
  }

}
