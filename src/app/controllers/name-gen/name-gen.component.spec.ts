import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameGenComponent } from './name-gen.component';

describe('NameGenComponent', () => {
  let component: NameGenComponent;
  let fixture: ComponentFixture<NameGenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NameGenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NameGenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
