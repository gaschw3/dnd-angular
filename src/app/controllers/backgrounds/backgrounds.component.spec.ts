import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BackgroundsComponent } from './backgrounds.component';

describe('ClassesComponent', () => {
  let component: BackgroundsComponent;
  let fixture: ComponentFixture<BackgroundsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BackgroundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
