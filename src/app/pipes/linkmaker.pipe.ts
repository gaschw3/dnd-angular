import { SplitInterpolation } from '@angular/compiler';
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
      var cleanString = match.replace('{', '').replace('}', '');
      if (cleanString.includes('|')) {
        linkText = cleanString.split('|')[1];
        cleanString = cleanString.split('|')[0];
      }
      if (cleanString.includes('?')) {
        queryText = cleanString.split('?')[1];
        cleanString = cleanString.split('?')[0];
      }
      var splitArr = cleanString.split(' ');
      var linkPath = splitArr.slice(1).join(' ');
      var linkLocation = linkPath.replace(/[\s\/]/g, '-').replace(/[^\w-]/g, '').toLowerCase();
      var linkRoot = splitArr.slice(0, 1).toString().replace('creature', 'beastiary').replace('spells', 'spell').replace('spell', 'spells').replace('item', 'tems').replace('@', '/');
      if (queryText !== '') {
        var href = linkRoot + '?' + queryText;
      } else {
        var href = linkRoot + '/' + linkLocation;
      }
      // a bunch of these are used in Foundry but I don't really want to make handler pages for all of them
      // just ignore those and print the text
      if (splitArr.slice(0,1).toString() == '@damage' || splitArr.slice(0,1).toString() == '@scaledamage' || splitArr.slice(0,1).toString() == '@dice' || splitArr.slice(0,1).toString() == '@scaledice' || splitArr.slice(0,1).toString() == '@condition' || splitArr.slice(0,1).toString() == '@skill' || splitArr.slice(0,1).toString() == '@hit' || splitArr.slice(0,1).toString() == '@sense' || splitArr.slice(0,1).toString() == '@chance' || splitArr.slice(0,1).toString() == '@h' || splitArr.slice(0,1).toString() == '@atk') {
        if (splitArr.slice(0,1).toString() == '@hit') {
          return `+${linkText === '' ? linkPath : linkText}`;
        } else if (splitArr.slice(0,1).toString() == '@atk') {
          return `<em>${linkPath.replace('ms', 'Melee Spell').replace('rs', 'Ranged Spell').replace('mw', 'Melee Weapon').replace('mw', 'Ranged Weapon').replace(',', ' or ') + ' Attack:'}</em>`;
        } else {
          return `${linkText === '' ? linkPath : linkText}`;
        }
      } else {
        return `<a href='.${href}'>${linkText === '' ? linkPath : linkText}</a>`;
      }
    }

    if (value.includes('@')) {
      str = value.toString().replace(/{@h}/g, 'Hit: ')
        .replace(/{@(\w+) ([\w\-\s/'\|\?\=(),\&%\+]+)}/g, replaceLinks);
      return str;
    } else {
      return value;
    }
  }

}
