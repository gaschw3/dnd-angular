import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherFeaturesComponent } from './other-features.component';

describe('OtherFeaturesComponent', () => {
  let component: OtherFeaturesComponent;
  let fixture: ComponentFixture<OtherFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherFeaturesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
