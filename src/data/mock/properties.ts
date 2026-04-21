import type { Property } from '../../types';

export const mockProperties: Property[] = [
  {
    id: 'prop_001',
    name: 'The Grand Meridian',
    address: '14 Rue de Rivoli',
    city: 'Paris',
    country: 'France',
    timezone: 'Europe/Paris',
    currency: 'EUR',
    defaultLanguage: 'fr',
    starRating: 5,
    roomCount: 186,
  },
  {
    id: 'prop_002',
    name: 'Château Lumière',
    address: '8 Avenue Montaigne',
    city: 'Cannes',
    country: 'France',
    timezone: 'Europe/Paris',
    currency: 'EUR',
    defaultLanguage: 'fr',
    starRating: 5,
    roomCount: 94,
  },
  {
    id: 'prop_003',
    name: 'Palazzo Adriatico',
    address: 'Calle Vallaresso 1332',
    city: 'Venice',
    country: 'Italy',
    timezone: 'Europe/Rome',
    currency: 'EUR',
    defaultLanguage: 'it',
    starRating: 5,
    roomCount: 72,
  },
];

export const currentProperty = mockProperties[0];
