import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BeastiaryComponent } from './beastiary.component';

describe('BeastiaryComponent', () => {
  let component: BeastiaryComponent;
  let fixture: ComponentFixture<BeastiaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BeastiaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeastiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
