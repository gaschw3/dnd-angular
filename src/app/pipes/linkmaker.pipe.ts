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
      var linkLocation = linkPath.replace(/[\s\/]/g, '-').replace(/[^\w-\/]/g, '').toLowerCase();
      // XXX:special case for specific EI link - should not be done this way
      linkLocation = linkLocation.replace('ei-', 'EI\/');
      var linkRoot = splitArr.slice(0, 1).toString().replace('creature', 'beastiary').replace('spells', 'spell').replace('spell', 'spells').replace('items', 'item').replace('item', 'items').replace('feat ', 'feats ').replace('@', '/');
      if (queryText !== '') {
        var href = linkRoot + '?' + queryText;
      } else {
        var href = linkRoot + '/' + linkLocation;
      }
      // a bunch of these are used in Foundry but I don't really want to make handler pages for all of them
      // most of these get ignored, a few special ones are turned into stuff like text decorations
      if (splitArr.slice(0,1).toString() == '@damage' || splitArr.slice(0,1).toString() == '@scaledamage' || splitArr.slice(0,1).toString() == '@dice' || splitArr.slice(0,1).toString() == '@scaledice' || splitArr.slice(0,1).toString() == '@condition' || splitArr.slice(0,1).toString() == '@skill' || splitArr.slice(0,1).toString() == '@hit' || splitArr.slice(0,1).toString() == '@sense' || splitArr.slice(0,1).toString() == '@chance' || splitArr.slice(0,1).toString() == '@h' || splitArr.slice(0,1).toString() == '@atk' || splitArr.slice(0,1).toString() == '@dc' || splitArr.slice(0,1).toString() == '@atkr' || splitArr.slice(0,1).toString() == '@actSave' || splitArr.slice(0,1).toString() == '@actSaveFail' || splitArr.slice(0,1).toString() == '@actSaveSuccess' || splitArr.slice(0,1).toString() == '@b' ||splitArr.slice(0,1).toString() == '@i' || splitArr.slice(0,1).toString() == '@filter') {
        if (splitArr.slice(0,1).toString() == '@hit') {
          return `+${linkText === '' ? linkPath : linkText}`;
        } else if (splitArr.slice(0,1).toString() == '@actSave') {
          return `<em>${linkPath + ' Saving Throw:'}</em>`;
        } else if (splitArr.slice(0,1).toString() == '@actSaveFail') {
          return `<em>${'Failure: '}</em>`;
        } else if (splitArr.slice(0,1).toString() == '@actSaveSuccess') {
            return `<em>${'Success: '}</em>`;
        } else if (splitArr.slice(0,1).toString() == '@dc') {
            return `DC ${linkPath}`;
        } else if (splitArr.slice(0,1).toString() == '@atk' || splitArr.slice(0,1).toString() == '@atkr') {
          return `<em>${linkPath.replace('m', 'Melee').replace('r', 'Ranged').replaceAll('s', ' Spell').replaceAll('w', ' Weapon').replace(',', ' or ') + ' Attack:'}</em>`;
        } else if (splitArr.slice(0,1).toString() == '@b') {
          return `<strong>${linkText === '' ? linkPath : linkText}</strong>`
        } else if (splitArr.slice(0,1).toString() == '@i') {
          return `<em>${linkText === '' ? linkPath : linkText}</em>`
        } else {
          return `${linkText === '' ? linkPath : linkText}`;
        }
      } else {
        return `<a href='.${href}'>${linkText === '' ? linkPath : linkText}</a>`;
      }
    }

    if (value && value.includes('@')) {
      str = value.toString().replace(/{@h}/g, '<em>Hit: </em>')
        .replace(/{@([\w-]+)\s?([\w\-\s/'\|\?\=(),\.\:\&%\+]+)?}/g, replaceLinks);
      return str;
    } else {
      return value;
    }
  }

}
