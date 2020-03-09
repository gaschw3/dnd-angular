import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkmaker'
})
export class LinkmakerPipe implements PipeTransform {

  transform(value: string): string {
    var str;
    if (value.includes('@')) {
      str = value.toString()
        .replace(/{@([\w/\-]*) ([\w\-\s/']+)}/g, '<a href="$1">$2</a>');
      return str;
    } else {
      return value;
    }
  }

}
