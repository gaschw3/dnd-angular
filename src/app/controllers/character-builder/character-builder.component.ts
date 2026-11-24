import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCopy, faCheck, faMinus, faPlus, faRotateLeft } from '@fortawesome/free-solid-svg-icons';

import { Background } from '../../models/background';
import { Feat } from '../../models/feat';
import { DndDataService } from '../../shared/services/dnd-data.service';
import { copyToClipboard } from '../../shared/helpers/format.utils';
import { HelperService } from '../../shared/helpers/helper.service';
import { BackgroundComponent } from '../backgrounds/background/background.component';
import { FeatComponent } from '../feats/feat/feat.component';

export type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface AbilityStat {
  key: StatKey;
  label: string;
  base: number;
  bonus: number;
}

interface StoredCharacterBuilderState {
  totalPoints: number;
  extendedRange: boolean;
  freeformAsi: boolean;
  backgroundId: string | null;
  customOriginFeat: boolean;
  originFeatId: string | null;
  stats: { key: StatKey; base: number; bonus: number }[];
}

const STORAGE_KEY = 'eotcc_character_builder_v1';

const ABILITY_NAME_TO_KEY: Record<string, StatKey> = {
  strength: 'str',
  dexterity: 'dex',
  constitution: 'con',
  intelligence: 'int',
  wisdom: 'wis',
  charisma: 'cha'
};

const POINT_COST_TABLE: Record<number, number> = {
  6: -2,
  7: -1,
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
  16: 12,
  17: 15,
  18: 19
};

const MAX_BONUS_TOTAL = 3;
const MAX_BONUS_PER_STAT = 2;

const DEFAULT_STATS: AbilityStat[] = [
  { key: 'str', label: 'Strength', base: 8, bonus: 0 },
  { key: 'dex', label: 'Dexterity', base: 8, bonus: 0 },
  { key: 'con', label: 'Constitution', base: 8, bonus: 0 },
  { key: 'int', label: 'Intelligence', base: 8, bonus: 0 },
  { key: 'wis', label: 'Wisdom', base: 8, bonus: 0 },
  { key: 'cha', label: 'Charisma', base: 8, bonus: 0 }
];

@Component({
  imports: [UpperCasePipe, FormsModule, FaIconComponent, BackgroundComponent, FeatComponent],
  selector: 'app-character-builder',
  templateUrl: './character-builder.component.html',
  styleUrls: ['./character-builder.component.scss']
})
export class CharacterBuilderComponent implements OnInit {
  readonly faPlus = faPlus;
  readonly faMinus = faMinus;
  readonly faCopy = faCopy;
  readonly faCheck = faCheck;
  readonly faRotateLeft = faRotateLeft;

  readonly budgetPresets = [27, 30, 32];
  readonly maxBonusTotal = MAX_BONUS_TOTAL;
  readonly maxBonusPerStat = MAX_BONUS_PER_STAT;

  readonly backgrounds = signal<Background[]>([]);
  readonly originFeats = signal<Feat[]>([]);
  readonly selectedBackgroundId = signal<string | null>(null);
  readonly customOriginFeat = signal(false);
  readonly selectedOriginFeatId = signal<string | null>(null);
  readonly freeformAsi = signal(false);
  readonly extendedRange = signal(false);
  readonly totalPoints = signal(27);
  readonly copied = signal(false);
  readonly stats = signal<AbilityStat[]>(DEFAULT_STATS.map(s => ({ ...s })));

  private copyResetTimer?: ReturnType<typeof setTimeout>;

  private dataService = inject(DndDataService);
  public helper = inject(HelperService);
  private destroyRef = inject(DestroyRef);

  readonly minScore = computed(() => (this.extendedRange() ? 6 : 8));
  readonly maxScore = computed(() => (this.extendedRange() ? 18 : 15));

  readonly selectedBackground = computed(() => {
    const id = this.selectedBackgroundId();
    return id ? this.backgrounds().find(bg => bg.id === id) : undefined;
  });

  readonly suggestedOriginFeat = computed(() => {
    const bg = this.selectedBackground();
    if (!bg?.feat) {
      return undefined;
    }
    const match = bg.feat.match(/\{@\w+\s+([^|}]+)/);
    const featName = (match ? match[1] : bg.feat).trim().toLowerCase();
    return this.originFeats().find(f => f.name.toLowerCase() === featName);
  });

  readonly activeOriginFeat = computed(() => {
    if (this.customOriginFeat()) {
      const id = this.selectedOriginFeatId();
      return this.originFeats().find(f => f.id === id);
    }
    return this.suggestedOriginFeat();
  });

  readonly allowedBackgroundStats = computed<StatKey[]>(() => {
    const bg = this.selectedBackground();
    if (!bg) {
      return ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    }
    return this.extractBackgroundStats(bg);
  });

  readonly pointsSpent = computed(() =>
    this.stats().reduce((sum, stat) => sum + this.pointCost(stat.base), 0)
  );

  readonly pointsRemaining = computed(() => this.totalPoints() - this.pointsSpent());

  readonly bonusSpent = computed(() => this.stats().reduce((sum, stat) => sum + stat.bonus, 0));

  readonly progressPercentage = computed(() => {
    const total = this.totalPoints();
    if (total <= 0) {
      return 0;
    }
    return Math.round((this.pointsRemaining() / total) * 100);
  });

  readonly clampedProgress = computed(() => Math.min(100, Math.abs(this.progressPercentage())));

  readonly isOverMax = computed(() => {
    const total = this.totalPoints();
    return total > 0 && this.pointsRemaining() > total;
  });

  readonly overflowProgress = computed(() => {
    const total = this.totalPoints();
    if (!this.isOverMax() || total <= 0) {
      return 0;
    }
    return Math.min(100, Math.round(((this.pointsRemaining() - total) / total) * 100));
  });

  readonly hasChanges = computed(() => this.stats().some(stat => stat.base !== 8 || stat.bonus !== 0));

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      if (this.copyResetTimer) {
        clearTimeout(this.copyResetTimer);
      }
    });

    this.restoreState();
    forkJoin({
      backgrounds: this.dataService.getBackgrounds(),
      feats: this.dataService.getFeats()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ backgrounds, feats }) => {
        this.backgrounds.set(backgrounds);
        const origins = feats.filter(f => f.category === 'O');
        this.originFeats.set(origins);
        if (this.selectedBackgroundId() && !this.selectedBackground()) {
          this.selectedBackgroundId.set(null);
        }
        const selectedOrigin = this.selectedOriginFeatId();
        if (selectedOrigin && !origins.some(f => f.id === selectedOrigin)) {
          this.selectedOriginFeatId.set(null);
        }
        this.enforceAllowedBonuses();
      });
  }

  isStatBonusAllowed(statKey: StatKey): boolean {
    if (this.freeformAsi() || !this.selectedBackground()) {
      return true;
    }
    return this.allowedBackgroundStats().includes(statKey);
  }

  canIncrementBase(stat: AbilityStat): boolean {
    return stat.base < this.maxScore();
  }

  canDecrementBase(stat: AbilityStat): boolean {
    return stat.base > this.minScore();
  }

  stepBase(stat: AbilityStat, delta: number): void {
    this.stats.update(list =>
      list.map(s => (s.key === stat.key ? { ...s, base: this.clampScore(s.base + delta) } : s))
    );
    this.persistState();
  }

  onBaseInputChange(stat: AbilityStat, rawValue: number | string): void {
    const parsed = Number(rawValue);
    const nextBase = this.clampScore(Number.isFinite(parsed) ? Math.round(parsed) : this.minScore());
    this.stats.update(list => list.map(s => (s.key === stat.key ? { ...s, base: nextBase } : s)));
    this.persistState();
  }

  canIncrementBonus(stat: AbilityStat): boolean {
    return (
      this.isStatBonusAllowed(stat.key) &&
      stat.bonus < MAX_BONUS_PER_STAT &&
      this.bonusSpent() < MAX_BONUS_TOTAL
    );
  }

  canDecrementBonus(stat: AbilityStat): boolean {
    return stat.bonus > 0;
  }

  stepBonus(stat: AbilityStat, delta: number): void {
    const current = this.stats().find(s => s.key === stat.key);
    if (!current) {
      return;
    }
    if (delta > 0 && !this.canIncrementBonus(current)) {
      return;
    }
    if (delta < 0 && !this.canDecrementBonus(current)) {
      return;
    }
    const nextBonus = Math.max(0, Math.min(MAX_BONUS_PER_STAT, current.bonus + delta));
    this.stats.update(list => list.map(s => (s.key === stat.key ? { ...s, bonus: nextBonus } : s)));
    this.persistState();
  }

  setBudget(points: number): void {
    this.totalPoints.set(Math.max(0, Math.round(points)));
    this.persistState();
  }

  onBudgetInputChange(rawValue: number | string): void {
    const parsed = Number(rawValue);
    this.totalPoints.set(Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 27);
    this.persistState();
  }

  setBackground(id: string | null): void {
    this.selectedBackgroundId.set(id);
    this.enforceAllowedBonuses();
    this.persistState();
  }

  setFreeformAsi(enabled: boolean): void {
    this.freeformAsi.set(enabled);
    this.enforceAllowedBonuses();
    this.persistState();
  }

  setCustomOriginFeat(enabled: boolean): void {
    this.customOriginFeat.set(enabled);
    if (enabled && !this.selectedOriginFeatId()) {
      this.selectedOriginFeatId.set(this.suggestedOriginFeat()?.id ?? this.originFeats()[0]?.id ?? null);
    }
    this.persistState();
  }

  setOriginFeat(id: string | null): void {
    this.selectedOriginFeatId.set(id);
    this.persistState();
  }

  setExtendedRange(enabled: boolean): void {
    this.extendedRange.set(enabled);
    this.stats.update(list => list.map(s => ({ ...s, base: this.clampScore(s.base) })));
    this.persistState();
  }

  resetAll(): void {
    this.stats.update(list => list.map(s => ({ ...s, base: 8, bonus: 0 })));
    this.persistState();
  }

  pointCost(score: number): number {
    return POINT_COST_TABLE[score] ?? 0;
  }

  nextStepCost(score: number): number | null {
    if (score >= this.maxScore()) {
      return null;
    }
    return this.pointCost(score + 1) - this.pointCost(score);
  }

  getTotalScore(stat: AbilityStat): number {
    return stat.base + stat.bonus;
  }

  getMod(stat: AbilityStat): string {
    return this.helper.getStatMod(String(this.getTotalScore(stat)));
  }

  getModNum(stat: AbilityStat): number {
    return parseInt(this.getMod(stat), 10);
  }

  getBackgroundAbilitySummary(bg: Background): string {
    const keys = this.extractBackgroundStats(bg);
    return keys.length > 0 ? keys.map(k => k.toUpperCase()).join(', ') : 'Any';
  }

  buildSummaryText(): string {
    const selectedBg = this.selectedBackground();
    const bgName = selectedBg
      ? `${selectedBg.name}${this.freeformAsi() ? ' (Custom ASI)' : ''}`
      : 'Custom';
    const currentStats = this.stats();
    const statLine = currentStats
      .map(s => `${s.key.toUpperCase()} ${this.getTotalScore(s)} (${this.getMod(s)})`)
      .join(' | ');
    const chosenBonuses = currentStats
      .filter(s => s.bonus > 0)
      .map(s => `${s.key.toUpperCase()} +${s.bonus}`);
    const bonusLine = chosenBonuses.length > 0 ? chosenBonuses.join(', ') : 'None';
    const activeFeat = this.activeOriginFeat();
    const featLine = activeFeat ? ` | Origin Feat: ${activeFeat.name}` : '';
    return `Background: ${bgName}${featLine}\n${statLine}\nPoints: ${this.pointsSpent()}/${this.totalPoints()} | Bonus ASI: ${bonusLine}`;
  }

  copySummary(): void {
    copyToClipboard(this.buildSummaryText()).then(ok => {
      if (ok) {
        this.flashCopied();
      }
    });
  }

  private flashCopied(): void {
    this.copied.set(true);
    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
    }
    this.copyResetTimer = setTimeout(() => {
      this.copied.set(false);
    }, 1800);
  }

  private clampScore(score: number): number {
    return Math.max(this.minScore(), Math.min(this.maxScore(), score));
  }

  private enforceAllowedBonuses(): void {
    this.stats.update(list =>
      list.map(s => (this.isStatBonusAllowed(s.key) ? s : { ...s, bonus: 0 }))
    );
  }

  private extractBackgroundStats(bg: Background): StatKey[] {
    const entries = bg.entries;
    if (!Array.isArray(entries)) {
      return [];
    }
    for (const entry of entries) {
      if (entry?.items && Array.isArray(entry.items)) {
        const asiItem = entry.items.find(
          (item: { name?: string; entry?: string }) =>
            typeof item?.name === 'string' && /ability score/i.test(item.name)
        );
        if (asiItem?.entry && typeof asiItem.entry === 'string') {
          const parsed = asiItem.entry
            .split(/[,/]/)
            .map((part: string) => ABILITY_NAME_TO_KEY[part.trim().toLowerCase()])
            .filter((k: StatKey | undefined): k is StatKey => Boolean(k));
          if (parsed.length > 0) {
            return parsed;
          }
        }
      }
    }
    return [];
  }

  private persistState(): void {
    const payload: StoredCharacterBuilderState = {
      totalPoints: this.totalPoints(),
      extendedRange: this.extendedRange(),
      freeformAsi: this.freeformAsi(),
      backgroundId: this.selectedBackgroundId(),
      customOriginFeat: this.customOriginFeat(),
      originFeatId: this.selectedOriginFeatId(),
      stats: this.stats().map(s => ({ key: s.key, base: s.base, bonus: s.bonus }))
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota or private-browsing errors.
    }
  }

  private restoreState(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as Partial<StoredCharacterBuilderState>;
      if (typeof parsed.totalPoints === 'number' && parsed.totalPoints >= 0) {
        this.totalPoints.set(Math.round(parsed.totalPoints));
      }
      if (typeof parsed.extendedRange === 'boolean') {
        this.extendedRange.set(parsed.extendedRange);
      }
      if (typeof parsed.freeformAsi === 'boolean') {
        this.freeformAsi.set(parsed.freeformAsi);
      }
      if (typeof parsed.backgroundId === 'string' || parsed.backgroundId === null) {
        this.selectedBackgroundId.set(parsed.backgroundId);
      }
      if (typeof parsed.customOriginFeat === 'boolean') {
        this.customOriginFeat.set(parsed.customOriginFeat);
      }
      if (typeof parsed.originFeatId === 'string' || parsed.originFeatId === null) {
        this.selectedOriginFeatId.set(parsed.originFeatId);
      }
      if (Array.isArray(parsed.stats)) {
        const savedByKey = new Map(parsed.stats.map(s => [s.key, s]));
        this.stats.update(list =>
          list.map(stat => {
            const saved = savedByKey.get(stat.key);
            if (!saved) {
              return stat;
            }
            return {
              ...stat,
              base: this.clampScore(Number(saved.base) || 8),
              bonus: Math.max(0, Math.min(MAX_BONUS_PER_STAT, Number(saved.bonus) || 0))
            };
          })
        );
      }
    } catch {
      // Ignore malformed stored state.
    }
  }
}
