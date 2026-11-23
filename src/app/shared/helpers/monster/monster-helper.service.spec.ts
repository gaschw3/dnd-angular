import { describe, it, expect, beforeEach } from 'vitest';
import { MonsterHelperService } from './monster-helper.service';

describe('MonsterHelperService', () => {
  let service: MonsterHelperService;

  beforeEach(() => {
    service = new MonsterHelperService();
  });

  describe('getSortCr', () => {
    it('parses integer, fractional, and N/A challenge ratings for sorting', () => {
      expect(service.getSortCr('0')).toBe(0);
      expect(service.getSortCr('1/8')).toBe(0.125);
      expect(service.getSortCr('1/4')).toBe(0.25);
      expect(service.getSortCr('1/2')).toBe(0.5);
      expect(service.getSortCr('5')).toBe(5);
      expect(service.getSortCr('N/A')).toBe(10000);
    });
  });

  describe('getXpByCr', () => {
    it('returns XP for standard and fractional CRs', () => {
      expect(service.getXpByCr('0')).toBe(10);
      expect(service.getXpByCr('1/4')).toBe(50);
      expect(service.getXpByCr('5')).toBe(1800);
      expect(service.getXpByCr('30')).toBe(155000);
    });

    it('handles lair CR strings like "10 (11 in lair)"', () => {
      expect(service.getXpByCr('10 (11 in lair)')).toBe(5900);
    });

    it('returns 0 for unknown CR values', () => {
      expect(service.getXpByCr('N/A')).toBe(0);
    });
  });

  describe('translateAlignment', () => {
    it('translates standard alignment code arrays and special prefixes', () => {
      expect(service.translateAlignment(['L', 'E'])).toBe('lawful evil');
      expect(service.translateAlignment(['C', 'G'])).toBe('chaotic good');
      expect(service.translateAlignment(['NX', 'E'])).toBe('any non-evil');
      expect(service.translateAlignment('U')).toBe('unaligned');
    });
  });

  describe('translateSize and getType', () => {
    it('translates monster sizes', () => {
      expect(service.translateSize('M')).toBe('medium');
      expect(service.translateSize('G')).toBe('gargantuan');
    });

    it('formats plain, tagged, swarm, and choose monster types', () => {
      expect(service.getType('dragon')).toBe('dragon');
      expect(service.getType({ type: 'humanoid', tags: ['elf'] })).toBe('humanoid (elf)');
      expect(service.getType({ type: 'beasts', swarmSize: 'T' })).toBe('swarm of tiny beasts');
      expect(service.getType({ type: { choose: ['celestial', 'fey', 'fiend'] } })).toBe('celestial, fey or fiend');
    });
  });
});
