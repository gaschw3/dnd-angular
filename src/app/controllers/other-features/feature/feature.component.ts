import { Component, computed, input } from '@angular/core';
import { featureType, OtherFeature, Prerequisite } from 'src/app/models/otherFeature';
import { DetailHeaderComponent } from 'src/app/shared/detail-header/detail-header.component';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';

@Component({
  imports: [DetailHeaderComponent, EntryRendererComponent],
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss']
})
export class FeatureComponent {
  readonly feature = input.required<OtherFeature>();

  readonly typeLabel = computed(() => {
    const key = this.feature().featureType?.[0];
    return key ? featureType[key] || '' : '';
  });

  readonly prereqLabel = computed(() => formatFeaturePrereq(this.feature().prerequisite));
}

function formatFeaturePrereq(prereq?: Prerequisite[]): string {
  if (!prereq || prereq.length < 1) {
    return '';
  }
  const ret: string[] = [];
  const reqs = prereq[0];
  if (reqs.level !== undefined) {
    const className = reqs.level.class?.name ?? '';
    if (reqs.level.subclass !== undefined) {
      ret.push(`Level ${reqs.level.level} ${reqs.level.subclass.name}${className ? ' ' + className : ''}`);
    } else if (className) {
      ret.push(`Level ${reqs.level.level} ${className}`);
    } else {
      ret.push(`Level ${reqs.level.level}`);
    }
  }
  if (reqs.pact !== undefined) {
    ret.push(`Pact of the ${reqs.pact}`);
  }
  if (reqs.spell !== undefined) {
    ret.push(reqs.spell);
  }
  if (reqs.ability !== undefined) {
    reqs.ability.forEach(obj => {
      const arr = Object.entries(obj);
      ret.push(`${arr[0][0].replace(/^[a-z]/, c => c.toUpperCase())} ${arr[0][1]}`);
    });
  }
  if (reqs.item !== undefined) {
    ret.push(reqs.item[0]);
  }
  if (reqs.feature !== undefined) {
    ret.push(reqs.feature[0]);
  }
  return ret.join(', ');
}
