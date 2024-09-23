import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpicBoonsComponent } from './epic-boons.component';

describe('EpicBoonsComponent', () => {
  let component: EpicBoonsComponent;
  let fixture: ComponentFixture<EpicBoonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpicBoonsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EpicBoonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
