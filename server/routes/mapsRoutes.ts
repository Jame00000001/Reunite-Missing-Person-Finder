import { Router } from 'express';

const router = Router();

router.get('/search', async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (query.length < 2) {
    res.status(400).json({ success: false, message: 'Search query must contain at least 2 characters.' });
    return;
  }
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '5');
    const response = await fetch(url, { headers: { 'User-Agent': 'ReuniteMissingPersonFinder/1.0' } });
    if (!response.ok) throw new Error(`Geocoding service returned ${response.status}`);
    const rows = await response.json() as Array<{ place_id: number; display_name: string; lat: string; lon: string }>;
    res.json({ success: true, results: rows.map((row) => ({ id: String(row.place_id), displayName: row.display_name, latitude: Number(row.lat), longitude: Number(row.lon) })) });
  } catch {
    res.status(502).json({ success: false, message: 'Address lookup is temporarily unavailable.' });
  }
});

router.get('/reverse', async (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    res.status(400).json({ success: false, message: 'Valid latitude and longitude are required.' });
    return;
  }
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', String(latitude));
    url.searchParams.set('lon', String(longitude));
    url.searchParams.set('format', 'jsonv2');
    const response = await fetch(url, { headers: { 'User-Agent': 'ReuniteMissingPersonFinder/1.0' } });
    if (!response.ok) throw new Error(`Geocoding service returned ${response.status}`);
    const result = await response.json() as { place_id?: number; display_name?: string };
    res.json({ success: true, placeId: result.place_id ? String(result.place_id) : null, formattedAddress: result.display_name || '' });
  } catch {
    res.status(502).json({ success: false, message: 'Address lookup is temporarily unavailable.' });
  }
});

export default router;
