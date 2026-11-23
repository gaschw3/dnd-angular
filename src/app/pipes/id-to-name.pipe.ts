import { Pipe, PipeTransform } from '@angular/core';

export function slugifyName(value: string): string {
  return value
    .toLowerCase() //convert to lower case
    .replace(/<.*?>/g, '') //remove tags, really an 'occultum' item workaround
    .replace(/^\s+/, '') //remove leading space characters
    .replace(/\s+$/, '') //remove trailing space characters
    .replace(/\s+/g, '-') //convert other spaces to hyphens
    .replace(/[^a-zA-Z-]/g, ''); //remove non-alpha characters
}

@Pipe({
  name: 'idToName'
})
export class IdToNamePipe implements PipeTransform {
  transform(value: string): string {
    return slugifyName(value);
  }
}
