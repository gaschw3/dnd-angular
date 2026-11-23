import { TestBed } from '@angular/core/testing';
import { BackButtonDirective } from './back-button.directive';
import { Location } from '@angular/common';

describe('BackButtonDirective', () => {
  it('should create an instance', () => {
    const location = jasmine.createSpyObj<Location>('Location', ['back']);
    TestBed.configureTestingModule({
      providers: [{ provide: Location, useValue: location }]
    });
    const directive = TestBed.runInInjectionContext(() => new BackButtonDirective());
    expect(directive).toBeTruthy();
  });
});
