import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { Spell } from '../../models/spell';
import { newClass } from '../../models/newClass';
import { Monster } from '../../models/monster';
import { Item } from '../../models/item';
import { Ancestry } from '../../models/ancestry';
import { Background } from '../../models/background';
import { Feat } from '../../models/feat';
import { OtherFeature } from '../../models/otherFeature';
import { HelperService } from '../helpers/helper.service';

@Injectable({
  providedIn: 'root'
})
export class DndDataService {
  private spells$?: Observable<Spell[]>;
  private classes$?: Observable<newClass[]>;
  private monsters$?: Observable<Monster[]>;
  private items$?: Observable<Item[]>;
  private ancestries$?: Observable<Ancestry[]>;
  private legacyAncestries$?: Observable<Ancestry[]>;
  private backgrounds$?: Observable<Background[]>;
  private feats$?: Observable<Feat[]>;
  private epicBoons$?: Observable<Feat[]>;
  private otherFeatures$?: Observable<OtherFeature[]>;

  constructor(private http: HttpClient) {}

  getSpells(): Observable<Spell[]> {
    if (!this.spells$) {
      this.spells$ = forkJoin([
        this.http.get<{ spell: any[] }>('assets/data/2024/spells-small.json'),
        this.http.get<Record<string, any>>('assets/data/2024/spellSource.json')
      ]).pipe(
        map(([spellsData, spellSource]) =>
          spellsData.spell.map(spell => new Spell(spell, spellSource[spell.name.toLowerCase()]))
        ),
        shareReplay(1)
      );
    }
    return this.spells$;
  }

  getClasses(): Observable<newClass[]> {
    if (!this.classes$) {
      this.classes$ = this.http.get<any[]>('assets/data/2024/classes-small.json').pipe(
        map(inputClasses => inputClasses.map(inClass => new newClass(inClass))),
        shareReplay(1)
      );
    }
    return this.classes$;
  }

  getMonsters(): Observable<Monster[]> {
    if (!this.monsters$) {
      this.monsters$ = this.http.get<{ monsters: Monster[] }>('assets/data/2023/beastiary.json').pipe(
        map(beastiary =>
          beastiary.monsters.map(monster => ({
            ...monster,
            id: monster.id || HelperService.createIdFromName(monster.name)
          }))
        ),
        shareReplay(1)
      );
    }
    return this.monsters$;
  }

  getItems(): Observable<Item[]> {
    if (!this.items$) {
      this.items$ = this.http.get<Item[]>('assets/data/2024/items.json').pipe(
        map(items => [...items].sort((a, b) => a.name.localeCompare(b.name))),
        shareReplay(1)
      );
    }
    return this.items$;
  }

  getAncestries(): Observable<Ancestry[]> {
    if (!this.ancestries$) {
      this.ancestries$ = this.http.get<Ancestry[]>('assets/data/2024/ancestry-small.json').pipe(
        shareReplay(1)
      );
    }
    return this.ancestries$;
  }

  getLegacyAncestries(): Observable<Ancestry[]> {
    if (!this.legacyAncestries$) {
      this.legacyAncestries$ = this.http.get<Ancestry[]>('assets/data/2023/ancestryData.json').pipe(
        shareReplay(1)
      );
    }
    return this.legacyAncestries$;
  }

  getBackgrounds(): Observable<Background[]> {
    if (!this.backgrounds$) {
      this.backgrounds$ = this.http.get<any[]>('assets/data/2024/background-small.json').pipe(
        map(inputBackgrounds => inputBackgrounds.map(inBg => new Background(inBg))),
        shareReplay(1)
      );
    }
    return this.backgrounds$;
  }

  getFeats(): Observable<Feat[]> {
    if (!this.feats$) {
      this.feats$ = this.http.get<any[]>('assets/data/2024/feats-small.json').pipe(
        map(feats =>
          feats.map(feat => new Feat(feat)).sort((a, b) => a.name.localeCompare(b.name))
        ),
        shareReplay(1)
      );
    }
    return this.feats$;
  }

  getEpicBoons(): Observable<Feat[]> {
    if (!this.epicBoons$) {
      this.epicBoons$ = this.http.get<any[]>('assets/data/2024/epic-boons.json').pipe(
        map(feats =>
          feats.map(feat => new Feat(feat)).sort((a, b) => a.name.localeCompare(b.name))
        ),
        shareReplay(1)
      );
    }
    return this.epicBoons$;
  }

  getOtherFeatures(): Observable<OtherFeature[]> {
    if (!this.otherFeatures$) {
      this.otherFeatures$ = this.http.get<OtherFeature[]>('assets/data/2024/otherFeatures.json').pipe(
        shareReplay(1)
      );
    }
    return this.otherFeatures$;
  }
}
