import { IdToNamePipe } from './id-to-name.pipe';

describe('IdToNamePipe', () => {
  let pipe: IdToNamePipe;

  beforeEach(() => {
    pipe = new IdToNamePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('convert string to lowercase', () => {
    expect(pipe.transform('HELLO WORLD')).toBe('hello-world');
  });

  it('remove HTML tags', () => {
    expect(pipe.transform('<b>Hello</b> World')).toBe('hello-world');
  });

  it('trim leading and trailing spaces', () => {
    expect(pipe.transform('  Hello World  ')).toBe('hello-world');
  });

  it('multiple spaces to hyphens', () => {
    expect(pipe.transform('Hello    World')).toBe('hello-world');
  });

  it('remove non-alphabetic characters', () => {
    expect(pipe.transform('Hello@123 World!')).toBe('hello-world');
  });

  it('complex case', () => {
    const input = '  <span>Hello @World!</span>  ';
    expect(pipe.transform(input)).toBe('hello-world');
  });
});
