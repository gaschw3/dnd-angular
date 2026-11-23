import { Pipe, PipeTransform } from '@angular/core';

const LOWERCASE_EXCEPTIONS = new Set(['a', 'and', 'an', 'or', 'the', 'but', 'not', 'for']);

export function titlecaseExcept(value: string): string {
  if (!value) {
    return '';
  }

  return value
    .split(/([\s/]+)/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && LOWERCASE_EXCEPTIONS.has(lower)) {
        return lower;
      }
      return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

@Pipe({
  name: 'titlecaseExcept'
})
export class TitlecaseExceptPipe implements PipeTransform {
  transform(value: string): string | null {
    if (!value) {
      return null;
    }
    return titlecaseExcept(value);
  }
}