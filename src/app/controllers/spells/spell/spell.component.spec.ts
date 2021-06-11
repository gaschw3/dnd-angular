import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpellComponent } from './spell.component';

describe('SpellComponent', () => {
  let component: SpellComponent;
  let fixture: ComponentFixture<SpellComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
