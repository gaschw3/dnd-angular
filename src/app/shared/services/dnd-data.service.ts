import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { Spell } from '../../models/spell';
import { DndClass } from '../../models/dnd-class';
import { Monster, normalizeMonster } from '../../models/monster';
import { Item, normalizeItem } from '../../models/item';
import { Ancestry } from '../../models/ancestry';
import { Background } from '../../models/background';
import { Feat } from '../../models/feat';
import { OtherFeature, normalizeOtherFeature } from '../../models/otherFeature';

@Injectable({
  providedIn: 'root'
})
export class DndDataService {
  private spells$?: Observable<Spell[]>;
  private classes$?: Observable<DndClass[]>;
  private monsters$?: Observable<Monster[]>;
  private items$?: Observable<Item[]>;
  private ancestries$?: Observable<Ancestry[]>;
  private backgrounds$?: Observable<Background[]>;
  private feats$?: Observable<Feat[]>;
  private epicBoons$?: Observable<Feat[]>;
  private otherFeatures$?: Observable<OtherFeature[]>;
  private mapLocations$?: Observable<MapLocationsData>;

  private http = inject(HttpClient);

  getSpells(): Observable<Spell[]> {
    if (!this.spells$) {
      this.spells$ = forkJoin([
        this.http.get<{ spell: any[] }>('assets/data/2024/spells.json'),
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

  getClasses(): Observable<DndClass[]> {
    if (!this.classes$) {
      this.classes$ = this.http
        .get<ClassIndexEntry[]>('assets/data/2026/classes/index.json')
        .pipe(
          switchMap(entries =>
            entries.length
              ? forkJoin(entries.map(entry => this.http.get<any>(`assets/data/2026/classes/${entry.file}`)))
              : of([])
          ),
          map(inputClasses => inputClasses.map(inClass => new DndClass(inClass))),
          shareReplay(1)
        );
    }
    return this.classes$;
  }

  getMonsters(): Observable<Monster[]> {
    if (!this.monsters$) {
      this.monsters$ = this.http.get<{ monsters: any[] }>('assets/data/2023/beastiary.json').pipe(
        map(beastiary => beastiary.monsters.map(normalizeMonster)),
        shareReplay(1)
      );
    }
    return this.monsters$;
  }

  getItems(): Observable<Item[]> {
    if (!this.items$) {
      this.items$ = this.http.get<any[]>('assets/data/2024/items.json').pipe(
        map(items => items.map(normalizeItem).sort((a, b) => a.plainName.localeCompare(b.plainName))),
        shareReplay(1)
      );
    }
    return this.items$;
  }

  getAncestries(): Observable<Ancestry[]> {
    if (!this.ancestries$) {
      this.ancestries$ = this.http.get<Ancestry[]>('assets/data/2024/ancestry.json').pipe(
        shareReplay(1)
      );
    }
    return this.ancestries$;
  }

  getBackgrounds(): Observable<Background[]> {
    if (!this.backgrounds$) {
      this.backgrounds$ = this.http.get<any[]>('assets/data/2026/backgrounds.json').pipe(
        map(inputBackgrounds => inputBackgrounds.map(inBg => new Background(inBg))),
        shareReplay(1)
      );
    }
    return this.backgrounds$;
  }

  getFeats(): Observable<Feat[]> {
    if (!this.feats$) {
      this.feats$ = this.http.get<any[]>('assets/data/2026/feats.json').pipe(
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
      this.epicBoons$ = this.http.get<any[]>('assets/data/2026/epic-boons.json').pipe(
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
      this.otherFeatures$ = this.http.get<any[]>('assets/data/2026/otherFeatures.json').pipe(
        map(features => features.map(normalizeOtherFeature)),
        shareReplay(1)
      );
    }
    return this.otherFeatures$;
  }

  getMapLocations(): Observable<MapLocationsData> {
    if (!this.mapLocations$) {
      this.mapLocations$ = this.http.get<MapLocationsData>('assets/data/brew/mapLocations.json').pipe(
        shareReplay(1)
      );
    }
    return this.mapLocations$;
  }
}

export interface ClassIndexEntry {
  id: string;
  name: string;
  source: string;
  file: string;
}

export type MapCoordEntry = [string, number, number];

export interface MapLocationsData {
  continents: MapCoordEntry[];
  countries: MapCoordEntry[];
  seas: MapCoordEntry[];
  cities: MapCoordEntry[];
  towns: MapCoordEntry[];
  shizomi: MapCoordEntry[];
}
