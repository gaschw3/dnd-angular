import { TestBed } from '@angular/core/testing';

import { MonsterHelperService } from './monster-helper.service';

describe('MonsterHelperService', () => {
  let service: MonsterHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonsterHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
