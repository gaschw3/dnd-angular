import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PointBuyComponent } from './point-buy.component';

describe('PointBuyComponent', () => {
  let component: PointBuyComponent;
  let fixture: ComponentFixture<PointBuyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PointBuyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
