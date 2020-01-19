import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'archetypeFilter'
})
export class ArchetypeFilterPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return null;
  }

}
