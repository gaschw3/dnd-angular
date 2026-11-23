import { Component, computed, input } from '@angular/core';
import { Spell } from 'src/app/models/spell';
import { DetailHeaderComponent } from 'src/app/shared/detail-header/detail-header.component';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';
import { LinkmakerPipe } from 'src/app/pipes/linkmaker.pipe';

@Component({
  imports: [DetailHeaderComponent, EntryRendererComponent, LinkmakerPipe],
  selector: 'app-spell',
  templateUrl: './spell.component.html',
  styleUrls: ['./spell.component.scss']
})
export class SpellComponent {
  readonly spell = input.required<Spell>();

  readonly schoolKey = computed(() => (this.spell().school?.name || '').toLowerCase());

  readonly levelSchoolLabel = computed(() => {
    const s = this.spell();
    const level = Number(s.level);
    const school = s.school?.name || '';
    let base: string;
    if (level === 0) {
      base = `${school} Cantrip`;
    } else if (level === 1) {
      base = `1st-level ${school}`;
    } else if (level === 2) {
      base = `2nd-level ${school}`;
    } else if (level === 3) {
      base = `3rd-level ${school}`;
    } else {
      base = `${level}th-level ${school}`;
    }
    return s.ritual ? `${base} (Ritual)` : base;
  });

  readonly castingTimeLabel = computed(() => {
    const s = this.spell();
    const base = (s.time || '').trim();
    return s.ritual ? `${base} or ritual` : base;
  });
}
