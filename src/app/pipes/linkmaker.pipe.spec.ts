import { LinkmakerPipe } from './linkmaker.pipe';

describe('LinkmakerPipe', () => {
  let pipe: LinkmakerPipe;

  beforeEach(() => {
    pipe = new LinkmakerPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('convert basic link syntax to anchor', () => {
    const input = 'Check {@place Thing Name} for info.';
    const expected = 'Check <a class="internal-link" href="./place/thing-name">Thing Name</a> for info.';
    expect(pipe.transform(input)).toBe(expected);
  });

  it('handle | to set display text', () => {
    const input = 'Check {@place Thing Name|See More}';
    const expected = 'Check <a class="internal-link" href="./place/thing-name">See More</a>';
    expect(pipe.transform(input)).toBe(expected);
  });

  it('handle query params', () => {
    const input = 'Try {@place ?id=5|click here}';
    const expected = 'Try <a class="internal-link" href="./place?id=5">click here</a>';
    expect(pipe.transform(input)).toBe(expected);
  });

  it('handle path + query params + display text', () => {
    const input = 'Visit {@place Thing Name?id=5|link}';
    const expected = 'Visit <a class="internal-link" href="./place/thing-name?id=5">link</a>';
    expect(pipe.transform(input)).toBe(expected);
  });

  it('map singular tags like @feat, @spell, @creature to plural routes', () => {
    expect(pipe.transform('{@feat Alert}')).toBe('<a class="internal-link" href="./feats/alert">Alert</a>');
    expect(pipe.transform('{@spell Fireball}')).toBe('<a class="internal-link" href="./spells/fireball">Fireball</a>');
    expect(pipe.transform('{@creature Goblin}')).toBe('<a class="internal-link" href="./beastiary/goblin">Goblin</a>');
  });

  it('render non-routed Foundry tags as plain text or formatted labels', () => {
    expect(pipe.transform('{@conditions prone}')).toBe('prone');
    expect(pipe.transform('{@rule Bonus Action}')).toBe('Bonus Action');
    expect(pipe.transform('{@recharge 5}')).toBe('(Recharge 5–6)');
    expect(pipe.transform('{@recharge}')).toBe('(Recharge 6)');
  });

  it('replace {@h} with Hit text', () => {
    const input = 'This deals {@h} {@hit 5}';
    const expected = 'This deals <em>Hit: </em> +5';
    expect(pipe.transform(input)).toBe(expected);
  });

  it('{@b text} as bold', () => {
    const input = 'Use {@b strong text} to emphasize';
    const expected = 'Use <strong>strong text</strong> to emphasize';
    expect(pipe.transform(input)).toBe(expected);
  });

  it('{@i text} as italic', () => {
    const input = 'Use {@i soft text} gently';
    const expected = 'Use <em>soft text</em> gently';
    expect(pipe.transform(input)).toBe(expected);
  });

  it('replace {@actSave} with Save text', () => {
    const input = 'Make a {@actSave Wisdom}';
    const expected = 'Make a <em>Wisdom Saving Throw:</em>';
    expect(pipe.transform(input)).toBe(expected);
  });

  it('replace {@actSaveFail} fiel Failure text', () => {
    const input = 'On {@actSaveFail} take damage.';
    const expected = 'On <em>Failure: </em> take damage.';
    expect(pipe.transform(input)).toBe(expected);
  });

  it('repalce {@dc 15} with Check text', () => {
    const input = 'Check is {@dc 15}';
    const expected = 'Check is DC 15';
    expect(pipe.transform(input)).toBe(expected);
  });

  it('replace {@atk mw} with attack text', () => {
    const input = 'Perform {@atk mw}';
    const expected = 'Perform <em>Melee Weapon Attack:</em>';
    expect(pipe.transform(input)).toBe(expected);
  });

  it('handle mixed content correctly', () => {
    const input = 'See {@place Castle Black?view=map|Map View} and {@b Important}.';
    const expected = 'See <a class="internal-link" href="./place/castle-black?view=map">Map View</a> and <strong>Important</strong>.';
    expect(pipe.transform(input)).toBe(expected);
  });
});
