import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AncestriesComponent } from './ancestries.component';

describe('AncestriesComponent', () => {
  let component: AncestriesComponent;
  let fixture: ComponentFixture<AncestriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AncestriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AncestriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
