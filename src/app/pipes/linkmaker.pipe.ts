import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkmaker'
})
export class LinkmakerPipe implements PipeTransform {

  transform(value: string): string {
    var str;
    var linkText = '';
    var queryText = '';
    //probably too complex, but take a given string like:
    // {@... ...} and turn it into a href
    // {@place thing name} will convert to '.../place/thing-name' (weird characters removed, spaces to hyphens)
    // {@place thing name|other name} will convert to '.../place/thing-name' but display 'other name'
    // {@place ?param=val} will convert to '.../place?param=val'
    // {@place thing name?param=val} will convert to '.../place/thing-name?param=val'
    // {@place thing name?param=val|other name} will convert to '.../place/thing-name?param=val' but display 'other name'
    function replaceLinks(match) {
      var cleanString = match.replace("{", "").replace("}", "");
      if (cleanString.includes('|')) {
        linkText = cleanString.split('|')[1];
        cleanString = cleanString.split('|')[0];
      }
      if (cleanString.includes('?')) {
        queryText = cleanString.split('?')[1];
        cleanString = cleanString.split('?')[0];
      }
      var splitArr = cleanString.split(" ");
      var linkPath = splitArr.slice(1).join(" ");
      var linkLocation = linkPath.replace(/[\s\/]/g, "-").replace(/[^\w-]/g, '').toLowerCase();
      if (queryText !== '') {
        var href = splitArr.slice(0, 1).toString().replace('@', '/') + '?' + queryText;
      } else {
        var href = splitArr.slice(0, 1).toString().replace('@', '/') + '/' + linkLocation;
      }
      return `<a href="${href}">${linkText === '' ? linkPath : linkText}</a>`;
    }

    if (value.includes('@')) {
      str = value.toString()
        .replace(/{@(\w+) ([\w\-\s/'\|\?\=(),\&%]+)}/g, replaceLinks);
      return str;
    } else {
      return value;
    }
  }

}
