import { Pipe, PipeTransform } from '@angular/core';

// tags that get routed, some weird duplicates right now because of JSON errors
const ROUTE_MAP: Record<string, string> = {
  creature: 'beastiary',
  beastiary: 'beastiary',
  spell: 'spells',
  spells: 'spells',
  item: 'items',
  items: 'items',
  feat: 'feats',
  feats: 'feats',
  'epic-boon': 'epic-boons',
  'epic-boons': 'epic-boons',
  class: 'classes',
  classes: 'classes',
  background: 'backgrounds',
  backgrounds: 'backgrounds',
  ancestry: 'ancestries',
  ancestries: 'ancestries',
  'other-features': 'other-features'
};

// tags in JSON that I'm not currently handling - just render as werid text mostly
const PLAIN_TEXT_TAGS = new Set([
  'damage',
  'scaledamage',
  'dice',
  'scaledice',
  'condition',
  'conditions',
  'skill',
  'sense',
  'chance',
  'filter',
  'rule',
  'variantrule',
  'action',
  'quickref',
  'status',
  'itemMastery',
  'disease',
  'language',
  'book',
  'note',
  'optfeature',
  'hitYourSpellAttack',
  'classFeature',
  'subclassFeature'
]);

export function transformLinks(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  if (!value.includes('@')) {
    return value;
  }

  return value
    .toString()
    .replace(/{@h}/g, '<em>Hit: </em>')
    .replace(/{@([\w-]+)(?:\s([^}]+))?}/g, (_match, tag: string, rawBody = '') =>
      renderTag(tag, rawBody.trim())
    );
}

function renderTag(tag: string, rawBody: string): string {
  let body = rawBody;
  let displayText = '';
  let queryText = '';

  // Handle pipe syntax:
  // - {@place thing name|display text}
  // - {@classFeature Name|Class|Source|Level} -> show first segment if >2 parts
  if (body.includes('|')) {
    const parts = body.split('|');
    body = parts[0];
    if (parts.length === 2) {
      displayText = parts[1];
    } else if (tag === 'filter' || tag === 'classFeature' || tag === 'subclassFeature') {
      displayText = parts[0];
    } else {
      displayText = parts[parts.length - 1] || parts[0];
    }
  }

  if (body.includes('?')) {
    const [pathPart, queryPart] = body.split('?');
    body = pathPart;
    queryText = queryPart;
  }

  const label = displayText || body;

  switch (tag) {
    case 'hit':
      return `+${label}`;
    case 'actSave':
      return `<em>${body} Saving Throw:</em>`;
    case 'actSaveFail':
      return '<em>Failure: </em>';
    case 'actSaveSuccess':
      return '<em>Success: </em>';
    case 'actTrigger':
      return '<em>Trigger: </em>';
    case 'actResponse':
      return '<em>Response: </em>';
    case 'dc':
      return `DC ${body}`;
    case 'recharge':
      return body ? `(Recharge ${body}–6)` : '(Recharge 6)';
    case 'atk':
    case 'atkr':
      return `<em>${body
        .replace('m', 'Melee')
        .replace('r', 'Ranged')
        .replaceAll('s', ' Spell')
        .replaceAll('w', ' Weapon')
        .replace(',', ' or ')} Attack:</em>`;
    case 'b':
      return `<strong>${label}</strong>`;
    case 'i':
      return `<em>${label}</em>`;
    default:
      break;
  }

  if (PLAIN_TEXT_TAGS.has(tag)) {
    return label;
  }

  const routeRoot = ROUTE_MAP[tag] ?? tag;
  let slug = body
    .replace(/[\s/]/g, '-')
    .replace(/[^\w-/]/g, '')
    .toLowerCase();

  // Special case for Eldritch Invocation feature links
  slug = slug.replace(/^ei-/, 'EI/');

  const basePath = slug ? `/${routeRoot}/${slug}` : `/${routeRoot}`;
  const routePath = queryText ? `${basePath}?${queryText}` : basePath;

  return `<a class="internal-link" href=".${routePath}">${label}</a>`;
}

@Pipe({
  name: 'linkmaker'
})
export class LinkmakerPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return transformLinks(value);
  }
}
