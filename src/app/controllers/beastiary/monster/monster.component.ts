import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Monster } from 'src/app/models/monster';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { MonsterHelperService } from 'src/app/shared/helpers/monster/monster-helper.service';
import { DetailHeaderComponent } from 'src/app/shared/detail-header/detail-header.component';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';
import { LinkmakerPipe } from 'src/app/pipes/linkmaker.pipe';
import { TitlecaseExceptPipe } from 'src/app/pipes/titlecase-except.pipe';

export interface StatBlockAbility {
  label: string;
  score: string;
  mod: string;
}

export interface SpellLevelRow {
  label: string;
  spells: string;
}

@Component({
  imports: [CommonModule, DetailHeaderComponent, EntryRendererComponent, LinkmakerPipe],
  selector: 'app-monster',
  templateUrl: './monster.component.html',
  styleUrls: ['./monster.component.scss']
})
export class MonsterComponent {
  readonly monster = input.required<Monster>();

  public helper = inject(HelperService);
  public monsterService = inject(MonsterHelperService);
  private titleCase = new TitleCasePipe();
  private titlecaseExcept = new TitlecaseExceptPipe();

  private failedTokenUrl = signal('');

  readonly tokenUrl = computed(() => {
    const m = this.monster();
    if (!m.hasToken && !m.token) {
      return '';
    }
    const source = (m.source || '').replace("PHB'24", 'XPHB');
    return `https://5e.tools/img/bestiary/tokens/${source}/${m.name}.webp`;
  });

  readonly showToken = computed(() => {
    const url = this.tokenUrl();
    return Boolean(url) && this.failedTokenUrl() !== url;
  });

  readonly tokenSizeClass = computed(() => {
    const primary = (this.monster().size || 'M').toUpperCase().split(',').pop()?.trim() || 'M';
    const valid = new Set(['T', 'S', 'M', 'L', 'H', 'G']);
    return `monster-token-${valid.has(primary) ? primary.toLowerCase() : 'm'}`;
  });

  readonly subtitleText = computed(() => {
    const m = this.monster();
    const size = this.titleCase.transform(this.monsterService.translateSize(m.size) || m.size);
    const type = this.titlecaseExcept.transform(this.monsterService.getType(m.type) || '');
    const alignment = this.titlecaseExcept.transform(this.monsterService.translateAlignment(m.alignment) || '');
    return `${size} ${type}${alignment ? ', ' + alignment : ''}`.trim();
  });

  readonly crText = computed(() => {
    const cr = this.monster().cr;
    if (!cr) {
      return '';
    }
    const xp = this.monsterService.getXpByCr(cr);
    return xp > 0 ? `${cr} (${xp.toLocaleString('en-US')} XP)` : cr;
  });

  readonly abilities = computed<StatBlockAbility[]>(() => {
    const m = this.monster();
    return [
      { label: 'STR', score: m.str, mod: this.helper.getStatMod(m.str) },
      { label: 'DEX', score: m.dex, mod: this.helper.getStatMod(m.dex) },
      { label: 'CON', score: m.con, mod: this.helper.getStatMod(m.con) },
      { label: 'INT', score: m.int, mod: this.helper.getStatMod(m.int) },
      { label: 'WIS', score: m.wis, mod: this.helper.getStatMod(m.wis) },
      { label: 'CHA', score: m.cha, mod: this.helper.getStatMod(m.cha) }
    ];
  });

  getSpellLevelRows(sc: any): SpellLevelRow[] {
    if (!sc?.spells) {
      return [];
    }
    const defs: [string, string][] = [
      ['cantrip', 'Cantrips (at will)'],
      ['first', '1st level'],
      ['second', '2nd level'],
      ['third', '3rd level'],
      ['fourth', '4th level'],
      ['fifth', '5th level'],
      ['sixth', '6th level'],
      ['seventh', '7th level'],
      ['eighth', '8th level'],
      ['ninth', '9th level']
    ];
    const rows: SpellLevelRow[] = [];
    for (const [key, title] of defs) {
      const group = sc.spells[key];
      if (group?.spells?.length) {
        const slotSuffix = key !== 'cantrip' && group.slots ? ` (${group.slots} slots)` : '';
        rows.push({
          label: `${title}${slotSuffix}`,
          spells: group.spells.join(', ')
        });
      }
    }
    return rows;
  }

  onTokenError(): void {
    this.failedTokenUrl.set(this.tokenUrl());
  }
}
