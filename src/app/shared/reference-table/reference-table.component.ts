import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
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

@Component({
  selector: 'app-reference-table',
  imports: [CommonModule, FormsModule, FaIconComponent],
  templateUrl: './reference-table.component.html',
  styleUrls: ['./reference-table.component.scss']
})
export class ReferenceTableComponent<T = any> implements OnChanges {
  readonly faSearch = faSearch;
  @Input() tableId = 'tbl-reference';
  @Input() data: T[] | null = [];
  @Input() columns: ReferenceTableColumn<T>[] = [];
  @Input() rowKey?: (row: T) => string;
  @Input() selectedKey: string | null = null;
  @Input() paging = true;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 15, 30, 60, -1];
  @Input() itemLabel = 'items';
  @Input() defaultSortKey: string | null = null;
  @Input() defaultSortDir: 'asc' | 'desc' = 'asc';
  @Input() initialFilters: Record<string, string> = {};
  @Input() striped = false;
  @Input() showFilterRow = true;
  @Input() refreshKey?: unknown;

  @Output() rowClick = new EventEmitter<T>();

  filters: Record<string, string> = {};
  rangeFilters: Record<string, { min: number | null; max: number | null }> = {};

  sortKey: string | null = null;
  sortDir: 'asc' | 'desc' = 'asc';
  currentPage = 1;

  filteredRows: T[] = [];
  pagedRows: T[] = [];

  private sanitizer = inject(DomSanitizer);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultSortKey'] && this.sortKey === null) {
      this.sortKey = this.defaultSortKey;
      this.sortDir = this.defaultSortDir;
    }

    if (changes['columns']) {
      this.initFilterModels();
    }

    if (changes['initialFilters'] && this.initialFilters) {
      this.applyInitialFilters();
    }

    if (changes['data'] || changes['columns'] || changes['initialFilters'] || changes['pageSize']) {
      this.recompute(true);
    }
  }

  private initFilterModels(): void {
    for (const col of this.columns) {
      if (col.filterType === 'number-range' && !this.rangeFilters[col.key]) {
        this.rangeFilters[col.key] = { min: null, max: null };
      } else if (!(col.key in this.filters)) {
        this.filters[col.key] = '';
      }
    }
  }

  private applyInitialFilters(): void {
    for (const col of this.columns) {
      const fromId = col.filterId ? this.initialFilters[col.filterId] : undefined;
      const fromKey = this.initialFilters[col.key];
      const val = fromId ?? fromKey;
      if (val !== undefined && val !== null) {
        this.filters[col.key] = String(val);
      }
    }
  }

  onFilterChange(): void {
    this.recompute(true);
  }

  clearFilters(): void {
    for (const key of Object.keys(this.filters)) {
      this.filters[key] = '';
    }
    for (const key of Object.keys(this.rangeFilters)) {
      this.rangeFilters[key] = { min: null, max: null };
    }
    this.recompute(true);
  }

  get hasActiveFilters(): boolean {
    const hasText = Object.values(this.filters).some(v => v && v.trim().length > 0);
    const hasRange = Object.values(this.rangeFilters).some(r => r.min !== null && r.min !== undefined && (r.min as any) !== '' || r.max !== null && r.max !== undefined && (r.max as any) !== '');
    return hasText || hasRange;
  }

  toggleSort(col: ReferenceTableColumn<T>): void {
    if (col.sortable === false || col.action) {
      return;
    }
    if (this.sortKey === col.key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = col.key;
      this.sortDir = 'asc';
    }
    this.recompute(false);
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.recompute(true);
  }

  goToPage(page: number): void {
    const total = this.totalPages;
    this.currentPage = Math.max(1, Math.min(page, total));
    this.updatePagedRows();
  }

  get totalPages(): number {
    if (!this.paging || this.pageSize <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
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
  }

  get startIndex(): number {
    if (this.filteredRows.length === 0) {
      return 0;
    }
    if (!this.paging || this.pageSize <= 0) {
      return 1;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    if (!this.paging || this.pageSize <= 0) {
      return this.filteredRows.length;
    }
    return Math.min(this.currentPage * this.pageSize, this.filteredRows.length);
  }

  isRowActive(row: T): boolean {
    if (!this.rowKey || this.selectedKey == null) {
      return false;
    }
    return this.rowKey(row) === this.selectedKey;
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

  private recompute(resetPage: boolean): void {
    const source = this.data ?? [];

    let result = source.filter(row => {
      for (const col of this.columns) {
        if (col.filterable === false || col.filterType === 'none' || col.action) {
          continue;
        }
        if (col.filterType === 'number-range') {
          const range = this.rangeFilters[col.key];
          if (!range) {
            continue;
          }
          const hasMin = range.min !== null && range.min !== undefined && (range.min as any) !== '';
          const hasMax = range.max !== null && range.max !== undefined && (range.max as any) !== '';
          if (!hasMin && !hasMax) {
            continue;
          }
          const rawVal = col.sortValue ? col.sortValue(row) : (col.filterValue ? col.filterValue(row) : (col.value ? col.value(row) : 0));
          const numVal = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal)) || 0;
          if (hasMin && numVal < Number(range.min)) {
            return false;
          }
          if (hasMax && numVal > Number(range.max)) {
            return false;
          }
          continue;
        }

        const query = (this.filters[col.key] ?? '').trim();
        if (!query) {
          continue;
        }
        const raw = col.filterValue
          ? col.filterValue(row)
          : col.value
            ? col.value(row)
            : '';
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

    if (this.sortKey) {
      const sortCol = this.columns.find(c => c.key === this.sortKey);
      if (sortCol) {
        const dir = this.sortDir === 'asc' ? 1 : -1;
        result = [...result].sort((a, b) => {
          const valA = sortCol.sortValue ? sortCol.sortValue(a) : (sortCol.value ? sortCol.value(a) : '');
          const valB = sortCol.sortValue ? sortCol.sortValue(b) : (sortCol.value ? sortCol.value(b) : '');
          if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * dir;
          }
          return String(valA ?? '').localeCompare(String(valB ?? ''), undefined, { numeric: true, sensitivity: 'base' }) * dir;
        });
      }
    }

    this.filteredRows = result;
    if (resetPage) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.updatePagedRows();
  }

  private updatePagedRows(): void {
    if (!this.paging || this.pageSize <= 0) {
      this.pagedRows = this.filteredRows;
      return;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedRows = this.filteredRows.slice(start, start + this.pageSize);
  }
}
