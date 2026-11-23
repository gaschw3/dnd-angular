import { describe, it, expect, beforeEach } from 'vitest';
import { HelperService } from './helper.service';

describe('HelperService', () => {
  let service: HelperService;

  beforeEach(() => {
    service = new HelperService();
  });

  describe('getStatMod', () => {
    it('calculates D&D ability score modifiers correctly', () => {
      expect(service.getStatMod('1')).toBe('-5');
      expect(service.getStatMod('8')).toBe('-1');
      expect(service.getStatMod('9')).toBe('-1');
      expect(service.getStatMod('10')).toBe('0');
      expect(service.getStatMod('11')).toBe('0');
      expect(service.getStatMod('12')).toBe('+1');
      expect(service.getStatMod('15')).toBe('+2');
      expect(service.getStatMod('20')).toBe('+5');
    });
  });

  describe('createIdFromName', () => {
    it('normalizes names into URL-safe lowercase slugs', () => {
      expect(HelperService.createIdFromName("Mordenkainen's Sword")).toBe('mordenkainens-sword');
      expect(HelperService.createIdFromName('Fireball')).toBe('fireball');
      expect(HelperService.createIdFromName('Half-Elf / Wood')).toBe('half-elf--wood');
    });
  });

  describe('abs and counter', () => {
    it('returns absolute values and fixed-length arrays', () => {
      expect(service.abs(-4)).toBe(4);
      expect(service.abs(3)).toBe(3);
      expect(service.counter(5).length).toBe(5);
    });
  });
});
