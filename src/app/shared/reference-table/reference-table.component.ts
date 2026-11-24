import {
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faSearch } from '@fortawesome/free-solid-svg-icons';

export interface ReferenceTableAction<T> {
  icon: IconDefinition;
  btnClass?: string;
  ariaLabel: string;
  onClick: (row: T, event: MouseEvent) => void;
}

export interface ReferenceTableColumn<T> {
  key: string;
  label: string;
  placeholder?: string;
  filterId?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  filterColspan?: number;
  filterSkipCell?: boolean;
  filterType?: 'text' | 'regex' | 'number-range' | 'none';
  headerIcon?: boolean;
  isHtml?: boolean;
  min?: number;
  max?: number;
  value?: (row: T) => string | number;
  filterValue?: (row: T) => string | number;
  sortValue?: (row: T) => string | number;
  cellClass?: (row: T) => string;
  action?: ReferenceTableAction<T>;
}

@Directive({
  selector: 'ng-template[appTableCell]'
})
export class ReferenceTableCellDirective {
  readonly columnKey = input.required<string>({ alias: 'appTableCell' });
  readonly template = inject(TemplateRef<{ $implicit: any; col: ReferenceTableColumn<any> }>);
}

@Component({
  selector: 'app-reference-table',
  imports: [CommonModule, FormsModule, FaIconComponent],
  templateUrl: './reference-table.component.html',
  styleUrls: ['./reference-table.component.scss']
})
export class ReferenceTableComponent<T = any> {
  readonly faSearch = faSearch;

  readonly tableId = input('tbl-reference');
  readonly data = input<T[] | null>([]);
  readonly columns = input<ReferenceTableColumn<T>[]>([]);
  readonly rowKey = input<((row: T) => string) | undefined>(undefined);
  readonly selectedKey = input<string | null>(null);
  readonly paging = input(true);
  readonly pageSize = input(10);
  readonly pageSizeOptions = input<number[]>([10, 15, 30, 60, -1]);
  readonly itemLabel = input('items');
  readonly defaultSortKey = input<string | null>(null);
  readonly defaultSortDir = input<'asc' | 'desc'>('asc');
  readonly initialFilters = input<Record<string, string>>({});
  readonly striped = input(false);
  readonly showFilterRow = input(true);

  readonly rowClick = output<T>();

  private readonly cellDirs = contentChildren(ReferenceTableCellDirective);
  readonly cellTemplates = computed(() => {
    const map = new Map<string, TemplateRef<{ $implicit: T; col: ReferenceTableColumn<T> }>>();
    for (const dir of this.cellDirs()) {
      map.set(dir.columnKey(), dir.template);
    }
    return map;
  });

  readonly filters = signal<Record<string, string>>({});
  readonly rangeFilters = signal<Record<string, { min: number | null; max: number | null }>>({});
  readonly sortKey = linkedSignal<string | null>(() => this.defaultSortKey());
  readonly sortDir = linkedSignal<'asc' | 'desc'>(() => this.defaultSortDir());
  readonly activePageSize = linkedSignal<number>(() => this.pageSize());
  readonly currentPage = signal(1);

  private sanitizer = inject(DomSanitizer);

  readonly hasActiveFilters = computed(() => {
    const hasText = Object.values(this.filters()).some(v => v && v.trim().length > 0);
    const hasRange = Object.values(this.rangeFilters()).some(
      r =>
        (r.min !== null && r.min !== undefined && (r.min as unknown) !== '') ||
        (r.max !== null && r.max !== undefined && (r.max as unknown) !== '')
    );
    return hasText || hasRange;
  });

  readonly filteredRows = computed<T[]>(() => {
    const source = this.data() ?? [];
    const cols = this.columns();
    const textFilters = this.filters();
    const ranges = this.rangeFilters();

    let result = source.filter(row => {
      for (const col of cols) {
        if (col.filterable === false || col.filterType === 'none' || col.action) {
          continue;
        }
        if (col.filterType === 'number-range') {
          const range = ranges[col.key];
          if (!range) {
            continue;
          }
          const hasMin = range.min !== null && range.min !== undefined && (range.min as unknown) !== '';
          const hasMax = range.max !== null && range.max !== undefined && (range.max as unknown) !== '';
          if (!hasMin && !hasMax) {
            continue;
          }
          const rawVal = col.sortValue
            ? col.sortValue(row)
            : col.filterValue
              ? col.filterValue(row)
              : col.value
                ? col.value(row)
                : 0;
          const numVal = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal)) || 0;
          if (hasMin && numVal < Number(range.min)) {
            return false;
          }
          if (hasMax && numVal > Number(range.max)) {
            return false;
          }
          continue;
        }

        const query = (textFilters[col.key] ?? '').trim();
        if (!query) {
          continue;
        }
        const raw = col.filterValue ? col.filterValue(row) : col.value ? col.value(row) : '';
        const text = String(raw ?? '');

        if (col.filterType === 'regex') {
          try {
            const re = new RegExp(query, 'i');
            if (!re.test(text)) {
              return false;
            }
          } catch {
            if (!text.toLowerCase().includes(query.toLowerCase())) {
              return false;
            }
          }
        } else {
          if (!text.toLowerCase().includes(query.toLowerCase())) {
            return false;
          }
        }
      }
      return true;
    });

    const activeSortKey = this.sortKey();
    if (activeSortKey) {
      const sortCol = cols.find(c => c.key === activeSortKey);
      if (sortCol) {
        const dir = this.sortDir() === 'asc' ? 1 : -1;
        result = [...result].sort((a, b) => {
          const valA = sortCol.sortValue ? sortCol.sortValue(a) : sortCol.value ? sortCol.value(a) : '';
          const valB = sortCol.sortValue ? sortCol.sortValue(b) : sortCol.value ? sortCol.value(b) : '';
          if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * dir;
          }
          return (
            String(valA ?? '').localeCompare(String(valB ?? ''), undefined, {
              numeric: true,
              sensitivity: 'base'
            }) * dir
          );
        });
      }
    }

    return result;
  });

  readonly totalPages = computed(() => {
    const size = this.activePageSize();
    if (!this.paging() || size <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.filteredRows().length / size));
  });

  readonly pagedRows = computed<T[]>(() => {
    const rows = this.filteredRows();
    const size = this.activePageSize();
    if (!this.paging() || size <= 0) {
      return rows;
    }
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * size;
    return rows.slice(start, start + size);
  });

  readonly visiblePages = computed<number[]>(() => {
    const total = this.totalPages();
    const current = Math.min(this.currentPage(), total);
    const maxButtons = 5;
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    let start = Math.max(1, current - 2);
    const end = Math.min(total, start + maxButtons - 1);
    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }
    const pages: number[] = [];
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  });

  readonly startIndex = computed(() => {
    const len = this.filteredRows().length;
    if (len === 0) {
      return 0;
    }
    const size = this.activePageSize();
    if (!this.paging() || size <= 0) {
      return 1;
    }
    const page = Math.min(this.currentPage(), this.totalPages());
    return (page - 1) * size + 1;
  });

  readonly endIndex = computed(() => {
    const len = this.filteredRows().length;
    const size = this.activePageSize();
    if (!this.paging() || size <= 0) {
      return len;
    }
    const page = Math.min(this.currentPage(), this.totalPages());
    return Math.min(page * size, len);
  });

  constructor() {
    // Apply initialFilters whenever columns or initialFilters change
    effect(() => {
      const cols = this.columns();
      const init = this.initialFilters();
      untracked(() => {
        const nextText = { ...this.filters() };
        const nextRange = { ...this.rangeFilters() };
        let textChanged = false;
        let rangeChanged = false;

        for (const col of cols) {
          if (col.filterType === 'number-range') {
            if (!nextRange[col.key]) {
              nextRange[col.key] = { min: null, max: null };
              rangeChanged = true;
            }
          } else {
            const fromId = col.filterId ? init[col.filterId] : undefined;
            const fromKey = init[col.key];
            const val = fromId ?? fromKey;
            if (val !== undefined && val !== null) {
              const strVal = String(val);
              if (nextText[col.key] !== strVal) {
                nextText[col.key] = strVal;
                textChanged = true;
              }
            } else if (!(col.key in nextText)) {
              nextText[col.key] = '';
              textChanged = true;
            }
          }
        }

        if (textChanged) {
          this.filters.set(nextText);
        }
        if (rangeChanged) {
          this.rangeFilters.set(nextRange);
        }
      });
    });

    // Reset page when dataset, filters input, or page size changes
    effect(() => {
      this.data();
      this.initialFilters();
      this.activePageSize();
      this.currentPage.set(1);
    });

    // Jump to the page containing selectedKey when selection or dataset changes
    effect(() => {
      const selected = this.selectedKey();
      const keyFn = this.rowKey();
      const size = this.activePageSize();
      this.data();
      if (!this.paging() || size <= 0 || !selected || !keyFn) {
        return;
      }
      const rows = untracked(() => this.filteredRows());
      const idx = rows.findIndex(row => keyFn(row) === selected);
      if (idx === -1) {
        return;
      }
      const targetPage = Math.floor(idx / size) + 1;
      if (targetPage !== untracked(() => this.currentPage())) {
        this.currentPage.set(targetPage);
      }
    });
  }

  setFilter(key: string, value: string): void {
    this.filters.update(curr => ({ ...curr, [key]: value }));
    this.currentPage.set(1);
  }

  setRangeFilter(key: string, bound: 'min' | 'max', value: number | null): void {
    this.rangeFilters.update(curr => ({
      ...curr,
      [key]: { ...(curr[key] ?? { min: null, max: null }), [bound]: value }
    }));
    this.currentPage.set(1);
  }

  clearFilters(): void {
    const clearedText: Record<string, string> = {};
    for (const key of Object.keys(this.filters())) {
      clearedText[key] = '';
    }
    const clearedRange: Record<string, { min: number | null; max: number | null }> = {};
    for (const key of Object.keys(this.rangeFilters())) {
      clearedRange[key] = { min: null, max: null };
    }
    this.filters.set(clearedText);
    this.rangeFilters.set(clearedRange);
    this.currentPage.set(1);
  }

  toggleSort(col: ReferenceTableColumn<T>): void {
    if (col.sortable === false || col.action) {
      return;
    }
    if (this.sortKey() === col.key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(col.key);
      this.sortDir.set('asc');
    }
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  onPageSizeChange(size: number): void {
    this.activePageSize.set(Number(size));
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    const total = this.totalPages();
    this.currentPage.set(Math.max(1, Math.min(page, total)));
  }

  isRowActive(row: T): boolean {
    const keyFn = this.rowKey();
    const selected = this.selectedKey();
    if (!keyFn || selected == null) {
      return false;
    }
    return keyFn(row) === selected;
  }

  getCellValue(col: ReferenceTableColumn<T>, row: T): string {
    if (!col.value) {
      return '';
    }
    const v = col.value(row);
    return v === null || v === undefined ? '' : String(v);
  }

  getSafeHtml(col: ReferenceTableColumn<T>, row: T): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.getCellValue(col, row));
  }

  getCellClasses(col: ReferenceTableColumn<T>, row: T): string {
    const classes: string[] = [];
    if (col.align === 'center') {
      classes.push('text-center');
    } else if (col.align === 'right') {
      classes.push('text-end');
    }
    if (col.cellClass) {
      const custom = col.cellClass(row);
      if (custom) {
        classes.push(custom);
      }
    }
    return classes.join(' ');
  }

  onActionClick(col: ReferenceTableColumn<T>, row: T, event: MouseEvent): void {
    event.stopPropagation();
    col.action?.onClick(row, event);
  }
}
