// The localities Milquu delivers to. The customer app shows the customer's own
// area as their "deliver to" line, and delivery rounds are grouped by it, so
// this list is the single source of truth for both.
//
// Keep the slugs stable — they are stored on User.deliveryAddress.area.
export const SERVICE_AREAS = [
  { slug: 'new-panvel', name: 'New Panvel', city: 'Navi Mumbai' },
  { slug: 'panvel', name: 'Panvel', city: 'Navi Mumbai' },
  { slug: 'karanjade', name: 'Karanjade', city: 'Navi Mumbai' },
  { slug: 'kharghar', name: 'Kharghar', city: 'Navi Mumbai' },
  { slug: 'taloja', name: 'Taloja', city: 'Navi Mumbai' },
  { slug: 'kamothe', name: 'Kamothe', city: 'Navi Mumbai' },
  { slug: 'belapur', name: 'CBD Belapur', city: 'Navi Mumbai' },
  { slug: 'nerul', name: 'Nerul', city: 'Navi Mumbai' }
];

export const isServiceableArea = (slug) => SERVICE_AREAS.some((a) => a.slug === slug);

export const areaName = (slug) => SERVICE_AREAS.find((a) => a.slug === slug)?.name ?? null;
