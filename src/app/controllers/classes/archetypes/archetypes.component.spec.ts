import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ArchetypesComponent } from './archetypes.component';

describe('ArchetypesComponent', () => {
  let component: ArchetypesComponent;
  let fixture: ComponentFixture<ArchetypesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchetypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchetypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
