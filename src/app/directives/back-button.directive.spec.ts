import { BackButtonDirective } from './back-button.directive';
import { Location } from '@angular/common';

describe('BackButtonDirective', () => {
  it('should create an instance', () => {
    const location = jasmine.createSpyObj<Location>('Location', ['back']);
    const directive = new BackButtonDirective(location);
    expect(directive).toBeTruthy();
  });
});
