import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryRendererComponent } from './entry-renderer.component';

describe('EntryRendererComponent', () => {
  let component: EntryRendererComponent;
  let fixture: ComponentFixture<EntryRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntryRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntryRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
