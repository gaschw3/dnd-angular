import { describe, it, expect, beforeEach } from 'vitest';
import { TitlecaseExceptPipe } from './titlecase-except.pipe';

describe('TitlecaseExceptPipe', () => {
  let pipe: TitlecaseExceptPipe;

  beforeEach(() => {
    pipe = new TitlecaseExceptPipe();
  });

  it('capitalizes normal words while keeping prepositions lowercase after the first word', () => {
    expect(pipe.transform('sword of fire and ice')).toBe('Sword Of Fire and Ice');
    expect(pipe.transform('strength or dexterity')).toBe('Strength or Dexterity');
  });

  it('always capitalizes the first word even if it is an exception', () => {
    expect(pipe.transform('the book of vile darkness')).toBe('The Book Of Vile Darkness');
  });

  it('handles slash-separated ability scores', () => {
    expect(pipe.transform('str/dex +1')).toBe('Str/Dex +1');
  });

  it('returns null for empty strings', () => {
    expect(pipe.transform('')).toBeNull();
  });
});
