import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { BookmarksTrayComponent } from './bookmarks-tray.component';
import { BookmarksService } from '../services/bookmarks.service';

describe('BookmarksTrayComponent', () => {
  let component: BookmarksTrayComponent;
  let bookmarks: BookmarksService;
  let currentPath: string;
  let navigateByUrl: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    localStorage.clear();
    currentPath = '/spells?classes=Wizard&levels=3&sort=level&dir=desc#top';
    navigateByUrl = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [BookmarksTrayComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            events: new Subject(),
            url: '/',
            navigateByUrl
          }
        },
        {
          provide: Location,
          useValue: {
            path: () => currentPath,
            onUrlChange: () => () => undefined
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(BookmarksTrayComponent);
    component = fixture.componentInstance;
    bookmarks = TestBed.inject(BookmarksService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('preserves filter and sort query params (without hash) when pinning the current page', () => {
    expect(component.currentUrl()).toBe('/spells?classes=Wizard&levels=3&sort=level&dir=desc');

    component.pinCurrentPage();
    expect(bookmarks.count()).toBe(1);

    const pinned = bookmarks.items()[0];
    expect(pinned.route).toBe('/spells?classes=Wizard&levels=3&sort=level&dir=desc');
    expect(pinned.category).toBe('Spell');
    expect(pinned.name).toBe('Spells');
    expect(pinned.subtitle).toBe('Class: Wizard · Lvl: 3 · Sort: level ↓');
    expect(bookmarks.isBookmarked(component.currentUrl())).toBe(true);
  });

  it('pins a single-subclass class URL as a Subclass entry', () => {
    currentPath = '/classes/barbarian?subclass=Wild%20Magic';
    component.pinCurrentPage();

    const pinned = bookmarks.items()[0];
    expect(pinned.route).toBe('/classes/barbarian?subclass=Wild%20Magic');
    expect(pinned.category).toBe('Subclass');
    expect(pinned.name).toBe('Wild Magic');
    expect(pinned.subtitle).toBe('Barbarian');
  });

  it('navigates with full query string when selecting a pinned page', () => {
    const route = '/beastiary?crMin=5&crMax=10&leg=1&sort=cr&dir=desc';
    component.navigateTo(route);
    expect(navigateByUrl).toHaveBeenCalledWith(route);
  });

  it('ignores query param order and multi-value order when matching or unpinning bookmarks', () => {
    currentPath = '/spells?levels=3,1&classes=Wizard,Cleric&sort=level&dir=desc';
    component.pinCurrentPage();
    expect(bookmarks.count()).toBe(1);

    const reordered = '/spells?dir=desc&sort=level&classes=Cleric,Wizard&levels=1,3';
    expect(bookmarks.isBookmarked(reordered)).toBe(true);
    expect(bookmarks.routesMatch(bookmarks.items()[0].route, reordered)).toBe(true);

    currentPath = reordered;
    component.pinCurrentPage();
    expect(bookmarks.count()).toBe(0);
  });
});
