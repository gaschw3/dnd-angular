import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { toPlainSearchText } from 'src/app/shared/helpers/format.utils';

export type ChangeType = 'buff' | 'nerf' | 'change';

export function normalizeChangeType(value: unknown): ChangeType | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'buff' || normalized === 'nerf' || normalized === 'change') {
    return normalized;
  }
  return undefined;
}

const CHANGE_META: Record<ChangeType, { symbol: string; label: string; badgeClass: string }> = {
  buff: { symbol: '▲', label: 'Buffed', badgeClass: 'spell-tag-buff' },
  nerf: { symbol: '▼', label: 'Nerfed', badgeClass: 'spell-tag-nerf' },
  change: { symbol: '◆', label: 'Modified', badgeClass: 'spell-tag-change' }
};

@Component({
  selector: 'app-change-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (meta(); as m) {
      @if (variant() === 'pill') {
        <span
          [class]="'display-meta-pill change-meta-pill ' + m.badgeClass"
          [attr.title]="tooltip()"
        >
          <span class="change-pill-symbol">{{ m.symbol }}</span>
          <span class="change-pill-label">{{ m.label }}</span>
        </span>
      } @else {
        <span
          [class]="'spell-tag-badge ' + m.badgeClass"
          [attr.title]="tooltip()"
          [attr.aria-label]="tooltip()"
        >{{ m.symbol }}</span>
      }
    }
  `
})
export class ChangeBadgeComponent {
  readonly change = input<ChangeType | string | undefined>(undefined);
  readonly note = input<string | undefined>(undefined);
  readonly variant = input<'compact' | 'pill'>('compact');

  readonly type = computed(() => normalizeChangeType(this.change()));
  readonly meta = computed(() => {
    const t = this.type();
    return t ? CHANGE_META[t] : undefined;
  });
  readonly tooltip = computed(() => {
    const m = this.meta();
    if (!m) {
      return '';
    }
    const rawNote = this.note()?.trim();
    const n = rawNote ? toPlainSearchText(rawNote).replace(/\s+/g, ' ').trim() : '';
    return n ? `${m.label}: ${n}` : m.label;
  });
}
