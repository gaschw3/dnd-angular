import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'idToName'
})
export class IdToNamePipe implements PipeTransform {

  transform(value: string): string {
    value = value.toLowerCase(); //convert to lower case
    value = value.replace(/^\s+/, ""); //remove leading space characters
    value = value.replace(/\s+$/, ""); //remove trailing space characters
    value = value.replace(/\s+/g, '-');//convert other spaces to hyphens
    value = value.replace(/[^a-zA-Z-]/g, ""); //remove non-alpha characters
    return value;
  }
}
