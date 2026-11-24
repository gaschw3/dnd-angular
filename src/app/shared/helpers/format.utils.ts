import { transformLinks } from '../../pipes/linkmaker.pipe';

const ENTRY_TEXT_KEYS = [
  'name',
  'caption',
  'entry',
  'entries',
  'items',
  'colLabels',
  'rows',
  'column',
  'column2',
  'headerEntries',
  'footerEntries',
  'will',
  'daily',
  'spells',
  'once',
  'twice',
  'thrice',
  'cantrip',
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth'
] as const;

export function sourceColorClass(source?: string | null): string {
  return source ? `color-${source.replace(/[+-]/g, '').toLowerCase()}` : '';
}

export function toPlainSearchText(value: string): string {
  if (!value) {
    return '';
  }
  const transformed = value.includes('@') ? transformLinks(value) : value;
  return transformed.includes('<') ? transformed.replace(/<[^>]+>/g, ' ') : transformed;
}

export function extractEntryText(node: unknown): string {
  if (!node) {
    return '';
  }
  if (typeof node === 'string') {
    return toPlainSearchText(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractEntryText).filter(Boolean).join(' ');
  }
  if (typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    const chunks: string[] = [];
    for (const key of ENTRY_TEXT_KEYS) {
      if (obj[key]) {
        const text = extractEntryText(obj[key]);
        if (text) {
          chunks.push(text);
        }
      }
    }
    return chunks.join(' ');
  }
  return '';
}

export function buildSearchText(parts: string[]): string {
  return parts
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function matchesPhrase(searchText: string, query: string): boolean {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
  return !normalized || searchText.includes(normalized);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy textarea copy when clipboard API is blocked.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}
