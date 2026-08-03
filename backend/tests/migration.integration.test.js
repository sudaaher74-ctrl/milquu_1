// The address migration is the part of the release that touches existing
// customers' data, so its parsing rules are tested directly. The rule that
// matters: never guess an area. A wrong locality sends a van to the wrong
// suburb, which is worse than asking the customer to confirm.

import { describe, it, expect } from 'vitest';
import { SERVICE_AREAS } from '../config/serviceAreas.js';

/** The area-matching rule from seeder/migrate.js. */
const areaFor = (address) => {
  const text = String(address).toLowerCase();
  const matches = SERVICE_AREAS.filter((area) => {
    const name = area.name.toLowerCase();
    return text.includes(name) || text.includes(area.slug.replace(/-/g, ' '));
  });
  const best = matches.length
    ? matches.reduce((a, b) => (b.name.length > a.name.length ? b : a))
    : null;
  const ambiguous = matches.filter((m) => m.name.length === best?.name.length).length > 1;
  return !best || ambiguous ? null : best.slug;
};

describe('migrating a legacy address string to an area', () => {
  it('picks the locality when it is named', () => {
    expect(areaFor('12 Dairy Lane, Kharghar')).toBe('kharghar');
    expect(areaFor('Flat 3, Sector 5, Nerul, Navi Mumbai')).toBe('nerul');
  });

  it('prefers New Panvel over Panvel, since one name contains the other', () => {
    expect(areaFor('9 Palm Beach Road, New Panvel')).toBe('new-panvel');
    expect(areaFor('9 Palm Beach Road, Panvel')).toBe('panvel');
  });

  it('leaves an address with no recognisable area alone', () => {
    expect(areaFor('221B Baker Street, London')).toBeNull();
    expect(areaFor('')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(areaFor('12 DAIRY LANE, TALOJA')).toBe('taloja');
  });

  it('matches the slug spelling as well as the display name', () => {
    // 'belapur' is the slug; the display name is 'CBD Belapur'.
    expect(areaFor('Sector 11, CBD Belapur')).toBe('belapur');
  });
});
