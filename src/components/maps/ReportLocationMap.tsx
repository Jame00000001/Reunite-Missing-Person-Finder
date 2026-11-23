import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, ExternalLink } from 'lucide-react';
import {
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  createLeafletPinIcon,
} from './mapsConfig.ts';

interface ReportLocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  locationLabel: string;
  personName: string;
  isMissing: boolean;
}

const MapSizeFixer: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      map.setView([lat, lng], 15);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [lat, lng, map]);

  return null;
};

export const ReportLocationMap: React.FC<ReportLocationMapProps> = ({
  latitude,
  longitude,
  locationLabel,
  personName,
  isMissing,
}) => {
  const pinIcon = useMemo(
    () => createLeafletPinIcon(isMissing ? 'rose' : 'emerald'),
    [isMissing]
  );

  const hasCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  if (!hasCoords) {
    return null;
  }

  const osmUrl = `https://www.openstreetmap.org/?mlat=${encodeURIComponent(
    latitude!
  )}&mlon=${encodeURIComponent(longitude!)}#map=16/${encodeURIComponent(
    latitude!
  )}/${encodeURIComponent(longitude!)}`;

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-600" />
          <span>{isMissing ? 'Last Seen Location Map' : 'Found Location Map'}</span>
        </h4>
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
        >
          <span>Open in OpenStreetMap</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        <MapContainer
          center={[latitude!, longitude!]}
          zoom={15}
          className="w-full h-full z-0"
          scrollWheelZoom={false}
        >
          <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
          <MapSizeFixer lat={latitude!} lng={longitude!} />
          <Marker position={[latitude!, longitude!]} icon={pinIcon}>
            <Popup>
              <div className="text-slate-800 max-w-[210px]">
                <p className="text-xs font-bold text-slate-900 m-0">{personName}</p>
                <p className="text-[11px] text-slate-600 mt-1 mb-0">
                  {isMissing ? 'Last Seen:' : 'Found At:'} {locationLabel}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 mb-0">
                  {latitude!.toFixed(5)}, {longitude!.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};
