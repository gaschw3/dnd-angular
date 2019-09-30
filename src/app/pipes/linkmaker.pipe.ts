import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkmaker'
})
export class LinkmakerPipe implements PipeTransform {

  transform(value: string): string {
    var str;
    if (value) {
      str = value.toString()
        .replace(/{@([\w/]*) (\w*)}/g, '<a href="$1">$2</a>')
        .toLowerCase();
      return str;
    } else {
      return '';
    }
  }

}
