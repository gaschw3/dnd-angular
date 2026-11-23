import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FeatComponent } from './feat.component';

describe('FeatComponent', () => {
  let component: FeatComponent;
  let fixture: ComponentFixture<FeatComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [  ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
