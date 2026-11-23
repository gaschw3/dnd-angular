import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCopy, faCheck, faMinus, faPlus, faRotateLeft } from '@fortawesome/free-solid-svg-icons';

import { Background } from '../../models/background';
import { Feat } from '../../models/feat';
import { DndDataService } from '../../shared/services/dnd-data.service';
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

@Component({
  imports: [CommonModule, FormsModule, FaIconComponent, BackgroundComponent, FeatComponent],
  selector: 'app-character-builder',
  templateUrl: './character-builder.component.html',
  styleUrls: ['./character-builder.component.scss']
})
export class CharacterBuilderComponent implements OnInit, OnDestroy {
  readonly faPlus = faPlus;
  readonly faMinus = faMinus;
  readonly faCopy = faCopy;
  readonly faCheck = faCheck;
  readonly faRotateLeft = faRotateLeft;

  readonly budgetPresets = [27, 30, 32];
  readonly maxBonusTotal = MAX_BONUS_TOTAL;
  readonly maxBonusPerStat = MAX_BONUS_PER_STAT;

  backgrounds: Background[] = [];
  originFeats: Feat[] = [];
  selectedBackgroundId: string | null = null;
  customOriginFeat = false;
  selectedOriginFeatId: string | null = null;
  freeformAsi = false;
  extendedRange = false;
  totalPoints = 27;
  copied = false;

  stats: AbilityStat[] = [
    { key: 'str', label: 'Strength', base: 8, bonus: 0 },
    { key: 'dex', label: 'Dexterity', base: 8, bonus: 0 },
    { key: 'con', label: 'Constitution', base: 8, bonus: 0 },
    { key: 'int', label: 'Intelligence', base: 8, bonus: 0 },
    { key: 'wis', label: 'Wisdom', base: 8, bonus: 0 },
    { key: 'cha', label: 'Charisma', base: 8, bonus: 0 }
  ];

  private destroy$ = new Subject<void>();
  private copyResetTimer?: ReturnType<typeof setTimeout>;

  private dataService = inject(DndDataService);
  public helper = inject(HelperService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.restoreState();
    forkJoin({
      backgrounds: this.dataService.getBackgrounds(),
      feats: this.dataService.getFeats()
    }).pipe(takeUntil(this.destroy$)).subscribe(({ backgrounds, feats }) => {
      this.backgrounds = backgrounds;
      this.originFeats = feats.filter(f => f.category === 'O');
      if (this.selectedBackgroundId && !this.selectedBackground) {
        this.selectedBackgroundId = null;
      }
      if (this.selectedOriginFeatId && !this.originFeats.some(f => f.id === this.selectedOriginFeatId)) {
        this.selectedOriginFeatId = null;
      }
      this.enforceAllowedBonuses();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
    }
  }

  get minScore(): number {
    return this.extendedRange ? 6 : 8;
  }

  get maxScore(): number {
    return this.extendedRange ? 18 : 15;
  }

  get selectedBackground(): Background | undefined {
    if (!this.selectedBackgroundId) {
      return undefined;
    }
    return this.backgrounds.find(bg => bg.id === this.selectedBackgroundId);
  }

  get suggestedOriginFeat(): Feat | undefined {
    const bg = this.selectedBackground;
    if (!bg?.feat) {
      return undefined;
    }
    const match = bg.feat.match(/\{@\w+\s+([^|}]+)/);
    const featName = (match ? match[1] : bg.feat).trim().toLowerCase();
    return this.originFeats.find(f => f.name.toLowerCase() === featName);
  }

  get activeOriginFeat(): Feat | undefined {
    if (this.customOriginFeat) {
      return this.originFeats.find(f => f.id === this.selectedOriginFeatId);
    }
    return this.suggestedOriginFeat;
  }

  get allowedBackgroundStats(): StatKey[] {
    const bg = this.selectedBackground;
    if (!bg) {
      return ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    }
    return this.extractBackgroundStats(bg);
  }

  get pointsSpent(): number {
    return this.stats.reduce((sum, stat) => sum + this.pointCost(stat.base), 0);
  }

  get pointsRemaining(): number {
    return this.totalPoints - this.pointsSpent;
  }

  get bonusSpent(): number {
    return this.stats.reduce((sum, stat) => sum + stat.bonus, 0);
  }

  get progressPercentage(): number {
    if (this.totalPoints <= 0) {
      return 0;
    }
    return Math.round((this.pointsRemaining / this.totalPoints) * 100);
  }

  get clampedProgress(): number {
    return Math.min(100, Math.abs(this.progressPercentage));
  }

  get isOverMax(): boolean {
    return this.totalPoints > 0 && this.pointsRemaining > this.totalPoints;
  }

  get overflowProgress(): number {
    if (!this.isOverMax || this.totalPoints <= 0) {
      return 0;
    }
    return Math.min(100, Math.round(((this.pointsRemaining - this.totalPoints) / this.totalPoints) * 100));
  }

  get hasChanges(): boolean {
    return this.stats.some(stat => stat.base !== 8 || stat.bonus !== 0);
  }

  isStatBonusAllowed(statKey: StatKey): boolean {
    if (this.freeformAsi || !this.selectedBackground) {
      return true;
    }
    return this.allowedBackgroundStats.includes(statKey);
  }

  canIncrementBase(stat: AbilityStat): boolean {
    return stat.base < this.maxScore;
  }

  canDecrementBase(stat: AbilityStat): boolean {
    return stat.base > this.minScore;
  }

  stepBase(stat: AbilityStat, delta: number): void {
    stat.base = this.clampScore(stat.base + delta);
    this.persistState();
  }

  onBaseInputChange(stat: AbilityStat): void {
    const parsed = Number(stat.base);
    stat.base = this.clampScore(Number.isFinite(parsed) ? Math.round(parsed) : this.minScore);
    this.persistState();
  }

  canIncrementBonus(stat: AbilityStat): boolean {
    return (
      this.isStatBonusAllowed(stat.key) &&
      stat.bonus < MAX_BONUS_PER_STAT &&
      this.bonusSpent < MAX_BONUS_TOTAL
    );
  }

  canDecrementBonus(stat: AbilityStat): boolean {
    return stat.bonus > 0;
  }

  stepBonus(stat: AbilityStat, delta: number): void {
    if (delta > 0 && !this.canIncrementBonus(stat)) {
      return;
    }
    if (delta < 0 && !this.canDecrementBonus(stat)) {
      return;
    }
    stat.bonus = Math.max(0, Math.min(MAX_BONUS_PER_STAT, stat.bonus + delta));
    this.persistState();
  }

  setBudget(points: number): void {
    this.totalPoints = Math.max(0, Math.round(points));
    this.persistState();
  }

  onBudgetInputChange(): void {
    const parsed = Number(this.totalPoints);
    this.totalPoints = Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 27;
    this.persistState();
  }

  onBackgroundChange(): void {
    this.enforceAllowedBonuses();
    this.persistState();
  }

  onFreeformChange(): void {
    this.enforceAllowedBonuses();
    this.persistState();
  }

  onCustomOriginFeatChange(): void {
    if (this.customOriginFeat && !this.selectedOriginFeatId) {
      this.selectedOriginFeatId = this.suggestedOriginFeat?.id ?? this.originFeats[0]?.id ?? null;
    }
    this.persistState();
  }

  onOriginFeatChange(): void {
    this.persistState();
  }

  onExtendedRangeChange(): void {
    for (const stat of this.stats) {
      stat.base = this.clampScore(stat.base);
    }
    this.persistState();
  }

  resetAll(): void {
    for (const stat of this.stats) {
      stat.base = 8;
      stat.bonus = 0;
    }
    this.persistState();
  }

  pointCost(score: number): number {
    return POINT_COST_TABLE[score] ?? 0;
  }

  nextStepCost(score: number): number | null {
    if (score >= this.maxScore) {
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
    const bgName = this.selectedBackground
      ? `${this.selectedBackground.name}${this.freeformAsi ? ' (Custom ASI)' : ''}`
      : 'Custom';
    const statLine = this.stats
      .map(s => `${s.key.toUpperCase()} ${this.getTotalScore(s)} (${this.getMod(s)})`)
      .join(' | ');
    const chosenBonuses = this.stats
      .filter(s => s.bonus > 0)
      .map(s => `${s.key.toUpperCase()} +${s.bonus}`);
    const bonusLine = chosenBonuses.length > 0 ? chosenBonuses.join(', ') : 'None';
    const featLine = this.activeOriginFeat ? ` | Origin Feat: ${this.activeOriginFeat.name}` : '';
    return `Background: ${bgName}${featLine}\n${statLine}\nPoints: ${this.pointsSpent}/${this.totalPoints} | Bonus ASI: ${bonusLine}`;
  }

  copySummary(): void {
    const summary = this.buildSummaryText();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(summary).then(
        () => this.flashCopied(),
        () => this.fallbackCopy(summary)
      );
    } else {
      this.fallbackCopy(summary);
    }
  }

  private flashCopied(): void {
    this.copied = true;
    this.cdr.markForCheck();
    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
    }
    this.copyResetTimer = setTimeout(() => {
      this.copied = false;
      this.cdr.markForCheck();
    }, 1800);
  }

  private fallbackCopy(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.flashCopied();
    } finally {
      document.body.removeChild(textarea);
    }
  }

  private clampScore(score: number): number {
    return Math.max(this.minScore, Math.min(this.maxScore, score));
  }

  private enforceAllowedBonuses(): void {
    for (const stat of this.stats) {
      if (!this.isStatBonusAllowed(stat.key)) {
        stat.bonus = 0;
      }
    }
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
      totalPoints: this.totalPoints,
      extendedRange: this.extendedRange,
      freeformAsi: this.freeformAsi,
      backgroundId: this.selectedBackgroundId,
      customOriginFeat: this.customOriginFeat,
      originFeatId: this.selectedOriginFeatId,
      stats: this.stats.map(s => ({ key: s.key, base: s.base, bonus: s.bonus }))
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
        this.totalPoints = Math.round(parsed.totalPoints);
      }
      if (typeof parsed.extendedRange === 'boolean') {
        this.extendedRange = parsed.extendedRange;
      }
      if (typeof parsed.freeformAsi === 'boolean') {
        this.freeformAsi = parsed.freeformAsi;
      }
      if (typeof parsed.backgroundId === 'string' || parsed.backgroundId === null) {
        this.selectedBackgroundId = parsed.backgroundId;
      }
      if (typeof parsed.customOriginFeat === 'boolean') {
        this.customOriginFeat = parsed.customOriginFeat;
      }
      if (typeof parsed.originFeatId === 'string' || parsed.originFeatId === null) {
        this.selectedOriginFeatId = parsed.originFeatId;
      }
      if (Array.isArray(parsed.stats)) {
        for (const saved of parsed.stats) {
          const target = this.stats.find(s => s.key === saved.key);
          if (target) {
            target.base = this.clampScore(Number(saved.base) || 8);
            target.bonus = Math.max(0, Math.min(MAX_BONUS_PER_STAT, Number(saved.bonus) || 0));
          }
        }
      }
    } catch {
      // Ignore malformed stored state.
    }
  }
}
