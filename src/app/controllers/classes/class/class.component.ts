import { ViewportScroller } from '@angular/common';
import { Component, ViewChild, computed, inject, input, output, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { ClassFeature, newClass } from '../../../models';
import { FeaturesComponent } from '../features/features.component';
import { ArchetypesComponent } from '../archetypes/archetypes.component';
import { LinkmakerPipe } from 'src/app/pipes/linkmaker.pipe';

@Component({
  imports: [RouterModule, FaIconComponent, ArchetypesComponent, FeaturesComponent, LinkmakerPipe],
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss']
})
export class ClassComponent {
  readonly dndClass = input.required<newClass>();
  readonly selectedArchetypes = input<string[]>([]);
  readonly selectedArchetypesChange = output<string[]>();
  readonly talk = output<string>();
  readonly overviewExpanded = signal(true);
  readonly faChevronDown = faChevronDown;

  @ViewChild(FeaturesComponent) featuresCmp?: FeaturesComponent;

  private viewport = inject(ViewportScroller);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly prof = computed(() => this.dndClass().startingProficiencies);
  readonly multi = computed(() => this.dndClass().multiclassing);

  readonly sortedArchetypes = computed(() =>
    [...this.dndClass().subclass].sort((a, b) => a.name.localeCompare(b.name))
  );

  readonly filteredFeatures = computed<ClassFeature[]>(() => {
    const cls = this.dndClass();
    const selected = this.selectedArchetypes();
    const subFeatures = selected.length
      ? cls.subclassFeature.filter(f => selected.includes(f.subclassShortName))
      : [];

    return [...cls.classFeature, ...subFeatures].sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      const aIsSub = a.subclassShortName ? 1 : 0;
      const bIsSub = b.subclassShortName ? 1 : 0;
      return aIsSub - bIsSub;
    });
  });

  readonly outlineFeatures = computed<ClassFeature[]>(() =>
    this.filteredFeatures().filter(f => !f.subclassShortName || f.header !== 3)
  );

  toggleOverview(): void {
    this.overviewExpanded.update(expanded => !expanded);
  }

  onArchetypesChange(next: string[]): void {
    this.selectedArchetypesChange.emit(next);
  }

  jumpToFeature(id: string): void {
    if (!id) {
      return;
    }
    this.viewport.setOffset([0, 85]);
    this.viewport.scrollToAnchor(id);
    this.talk.emit(id);
  }

  onMobileJump(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = select.value;
    if (!id) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      fragment: id,
      queryParamsHandling: 'preserve'
    });
    this.jumpToFeature(id);
  }
}
