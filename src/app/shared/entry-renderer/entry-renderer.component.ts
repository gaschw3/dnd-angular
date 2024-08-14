import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'entry-renderer',
  templateUrl: './entry-renderer.component.html',
  styleUrls: ['./entry-renderer.component.scss'],
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
      } else if (entry.type == "column") {
        return "column";
      } else if (entry.type == "inset") {
        return "inset";
      } else {
        return "undef";
      }
    } else {
      return "";
    }
  }

  getListItemHtml(entry): string {
    //data isn't super clean, an "item" should only have an "entry":string, but very occasionally, one slips through that uses "entries":[] where the array is just one string - handle that case
    if (entry.entries)
      return '<strong>'+entry.name+'</strong> '+ entry.entries.join("\n");
    else
    return '<strong>'+entry.name+'</strong> '+ entry.entry
  }

}
