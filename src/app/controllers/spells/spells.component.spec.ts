import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpellsComponent } from './spells.component';
import { School, Source, Spell } from 'src/app/models';

describe('SpellsComponent', () => {
  let component: SpellsComponent;
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<SpellsComponent>;

  const mockSpell: Spell = {
    "name": "Tasha's Caustic Brew",
    "id": "tashas-caustic-brew",
    "source": Source.Tce,
    "level": "1",
    "school": School.Abjuration,
    "time": "1 action",
    "range": "Self (30-foot line)",
    "components": "V, S, M (a bit of rotten food)",
    "duration": "Concentration, up to 1 minute",
    "classes": "Artificier, Sorcerer, Wizard",
    "entries": [
        "A stream of acid emanates from you in a line 30 feet long and 5 feet wide in a direction you choose. Each creature in the line must succeed on a Dexterity saving throw or be covered in acid for the spell's duration or until a creature uses its action to scrape or wash the acid off itself or another creature. A creature covered in the acid takes 2d4 acid damage at start of each of its turns."
    ],
    "higher": "When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 2d4 for each slot level above 1st."
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [ SpellsComponent ]
    })
    .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpellsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getJSON() should call httP Get method for spell.json', () => {

    const req = httpMock.expectOne("assets/data/spellData.json");
    expect(req.request.method).toEqual("GET");
    req.flush(mockSpell);
  });

});
