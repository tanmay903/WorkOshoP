export const DEFAULT_COUNTRY = 'India';
export const DEFAULT_STATE = 'Assam';

/**
 * Configurable list of states supported for worker registration and permanent address settings.
 * Add, remove, or reorder entries here without modifying form or map components.
 */
export const CONFIGURABLE_STATES = [
  {
    id: 'assam',
    name: 'Assam',
    country: 'India',
    label: 'Assam, India',
    defaultCenter: { lat: 26.1445, lng: 91.7362 },
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    country: 'India',
    label: 'Meghalaya, India',
    defaultCenter: { lat: 25.5788, lng: 91.8933 },
  },
  {
    id: 'arunachal-pradesh',
    name: 'Arunachal Pradesh',
    country: 'India',
    label: 'Arunachal Pradesh, India',
    defaultCenter: { lat: 27.0844, lng: 93.6053 },
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    country: 'India',
    label: 'Nagaland, India',
    defaultCenter: { lat: 25.6751, lng: 94.1086 },
  },
  {
    id: 'manipur',
    name: 'Manipur',
    country: 'India',
    label: 'Manipur, India',
    defaultCenter: { lat: 24.8170, lng: 93.9368 },
  },
  {
    id: 'tripura',
    name: 'Tripura',
    country: 'India',
    label: 'Tripura, India',
    defaultCenter: { lat: 23.8315, lng: 91.2868 },
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    country: 'India',
    label: 'Mizoram, India',
    defaultCenter: { lat: 23.7271, lng: 92.7176 },
  },
  {
    id: 'west-bengal',
    name: 'West Bengal',
    country: 'India',
    label: 'West Bengal, India',
    defaultCenter: { lat: 22.5726, lng: 88.3639 },
  },
  {
    id: 'delhi',
    name: 'Delhi',
    country: 'India',
    label: 'Delhi, India',
    defaultCenter: { lat: 28.6139, lng: 77.2090 },
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    country: 'India',
    label: 'Maharashtra, India',
    defaultCenter: { lat: 19.0760, lng: 72.8777 },
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    country: 'India',
    label: 'Karnataka, India',
    defaultCenter: { lat: 12.9716, lng: 77.5946 },
  },
];

export const getStateConfig = (stateName = DEFAULT_STATE) =>
  CONFIGURABLE_STATES.find(
    (s) => s.name.toLowerCase() === String(stateName || '').trim().toLowerCase()
  ) || CONFIGURABLE_STATES[0];

