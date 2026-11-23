import L from 'leaflet';

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

export const DEFAULT_MAP_CENTER = {
  lat: 39.7817213,
  lng: -89.6501481,
};

const PIN_COLORS: Record<'rose' | 'emerald' | 'blue', { fill: string; stroke: string }> = {
  rose: { fill: '#e11d48', stroke: '#9f1239' },
  emerald: { fill: '#059669', stroke: '#065f46' },
  blue: { fill: '#2563eb', stroke: '#1e40af' },
};

export function createLeafletPinIcon(color: 'rose' | 'emerald' | 'blue' = 'rose'): L.DivIcon {
  const palette = PIN_COLORS[color];
  return L.divIcon({
    className: 'reunite-leaflet-pin',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42" fill="none">
      <path d="M16 1C7.716 1 1 7.716 1 16c0 10.667 13.3 23.627 14.374 24.652a.9.9 0 0 0 1.252 0C17.7 39.627 31 26.667 31 16 31 7.716 24.284 1 16 1Z" fill="${palette.fill}" stroke="${palette.stroke}" stroke-width="2"/>
      <circle cx="16" cy="15.5" r="5.5" fill="#ffffff"/>
    </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
}
