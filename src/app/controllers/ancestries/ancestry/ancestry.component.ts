import { Component, computed, input } from '@angular/core';
import { Ancestry } from 'src/app/models/ancestry';
import { DetailHeaderComponent } from 'src/app/shared/detail-header/detail-header.component';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';

const INTRO_TRAIT_NAMES = new Set(['age', 'alignment', 'size']);

const SIZE_TABLE: Record<string, string> = {
  T: 'Tiny',
  S: 'Small',
  M: 'Medium',
  L: 'Large',
  'S/M': 'Medium or Small, choose at creation'
};

@Component({
  imports: [DetailHeaderComponent, EntryRendererComponent],
  selector: 'app-ancestry',
  templateUrl: './ancestry.component.html',
  styleUrls: ['./ancestry.component.scss']
})
export class AncestryComponent {
  readonly ancestry = input.required<Ancestry>();

  readonly sizeLabel = computed(() => {
    const size = this.ancestry().size;
    return SIZE_TABLE[size] || size || '';
  });

  readonly speedLabel = computed(() => {
    const a = this.ancestry();
    return a.extraspeed ? `${a.speed} ft., ${a.extraspeed}` : `${a.speed} ft.`;
  });

  readonly introTraits = computed(() =>
    (this.ancestry().traits || []).filter(t => INTRO_TRAIT_NAMES.has((t.name || '').toLowerCase()))
  );

  readonly remainingTraits = computed(() =>
    (this.ancestry().traits || []).filter(t => !INTRO_TRAIT_NAMES.has((t.name || '').toLowerCase()))
  );
}
