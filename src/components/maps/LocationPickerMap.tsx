import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import {
  MapPin,
  Search,
  Crosshair,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  DEFAULT_MAP_CENTER,
  createLeafletPinIcon,
} from './mapsConfig.ts';
import { api } from '../../services/api.ts';
import { detectCurrentGpsPosition } from '../../utils/pushNotifications.ts';

export interface SelectedLocationValue {
  location: string;
  latitude: number | null;
  longitude: number | null;
  place_id?: string | null;
}

interface LocationPickerMapProps {
  value: SelectedLocationValue;
  onChange: (next: SelectedLocationValue) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  heightClass?: string;
  pinColor?: 'rose' | 'emerald' | 'blue';
}

interface AddressSearchResult {
  id: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

const MapController: React.FC<{
  center: { lat: number; lng: number };
  hasCoords: boolean;
  onMapClick: (lat: number, lng: number) => void;
}> = ({ center, hasCoords, onMapClick }) => {
  const map = useMap();
  const prevCoordsRef = useRef<string>('');

  // Ensure Leaflet measures container accurately inside animated modals
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [map]);

  // Smoothly pan/zoom when coordinates change
  useEffect(() => {
    if (!hasCoords) return;
    const key = `${center.lat.toFixed(6)},${center.lng.toFixed(6)}`;
    if (prevCoordsRef.current !== key) {
      prevCoordsRef.current = key;
      map.flyTo([center.lat, center.lng], Math.max(map.getZoom(), 15), {
        duration: 0.6,
      });
    }
  }, [center.lat, center.lng, hasCoords, map]);

  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Type address/landmark (click Search) or click directly on the map...',
  required = true,
  heightClass = 'h-60 sm:h-64',
  pinColor = 'rose',
}) => {
  const [searchInput, setSearchInput] = useState(value.location || '');
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const resolvedPinColor: 'rose' | 'emerald' | 'blue' =
    pinColor === 'emerald' || pinColor === 'blue' ? pinColor : 'rose';
  const pinIcon = useMemo(() => createLeafletPinIcon(resolvedPinColor), [resolvedPinColor]);

  useEffect(() => {
    setSearchInput(value.location || '');
  }, [value.location]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const hasCoords =
    typeof value.latitude === 'number' &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude);

  const mapCenter = hasCoords
    ? { lat: value.latitude!, lng: value.longitude! }
    : DEFAULT_MAP_CENTER;

  const resolveCoordinates = async (lat: number, lng: number) => {
    const roundedLat = Number(lat.toFixed(7));
    const roundedLng = Number(lng.toFixed(7));

    setStatusError(null);
    onChange({
      ...value,
      latitude: roundedLat,
      longitude: roundedLng,
    });

    setIsResolvingAddress(true);
    try {
      const res = await api.maps.reverseGeocode(roundedLat, roundedLng);
      const nextLocation =
        res.success && res.formattedAddress
          ? res.formattedAddress
          : value.location || `${roundedLat.toFixed(5)}, ${roundedLng.toFixed(5)}`;
      setSearchInput(nextLocation);
      onChange({
        location: nextLocation,
        latitude: roundedLat,
        longitude: roundedLng,
        place_id: res.placeId || null,
      });
    } catch {
      const fallback =
        value.location || `${roundedLat.toFixed(5)}, ${roundedLng.toFixed(5)}`;
      setSearchInput(fallback);
      onChange({
        location: fallback,
        latitude: roundedLat,
        longitude: roundedLng,
        place_id: null,
      });
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const handleExplicitSearch = async () => {
    const query = searchInput.trim();
    if (query.length < 2) {
      setStatusError('Please enter at least 2 characters before clicking Search.');
      return;
    }

    setStatusError(null);
    setIsSearching(true);
    try {
      const res = await api.maps.searchAddress(query);
      if (res.success && Array.isArray(res.results) && res.results.length > 0) {
        setSearchResults(res.results);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
        setStatusError(
          res.message ||
            'No matching places found. Please click directly on the map or use Detect My Location.'
        );
      }
    } catch {
      setStatusError(
        'Address lookup is temporarily unavailable. Click directly on the map or use Detect My Location.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (item: AddressSearchResult) => {
    setShowResults(false);
    setStatusError(null);
    setSearchInput(item.displayName);
    onChange({
      location: item.displayName,
      latitude: item.latitude,
      longitude: item.longitude,
      place_id: item.id,
    });
  };

  const handleDetectMyLocation = async () => {
    setStatusError(null);
    setShowResults(false);
    setIsDetectingGps(true);
    try {
      const pos = await detectCurrentGpsPosition();
      await resolveCoordinates(pos.latitude, pos.longitude);
    } catch (err: any) {
      setStatusError(err?.message || 'Unable to detect your GPS location.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  const resolveCoordinatesRef = useRef(resolveCoordinates);
  resolveCoordinatesRef.current = resolveCoordinates;

  const markerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const latLng = marker.getLatLng();
          resolveCoordinatesRef.current(latLng.lat, latLng.lng);
        }
      },
    }),
    []
  );

  return (
    <div ref={containerRef} className="space-y-2.5">
      {label && (
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-rose-600" />
          <span>{label}</span>
        </label>
      )}

      {/* Search + Detect My Location Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 flex gap-1.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required={required}
              value={searchInput}
              onChange={(e) => {
                const next = e.target.value;
                setSearchInput(next);
                onChange({ ...value, location: next });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleExplicitSearch();
                }
              }}
              placeholder={placeholder}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {(isSearching || isResolvingAddress) && (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>

          <button
            type="button"
            onClick={handleExplicitSearch}
            disabled={isSearching}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-colors shrink-0 disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <ul className="absolute z-[1000] top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
              {searchResults.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 transition-colors flex items-start gap-2.5"
                  >
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 line-clamp-2">
                        {item.displayName}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={handleDetectMyLocation}
          disabled={isDetectingGps}
          className="px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
        >
          {isDetectingGps ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5" />
          )}
          <span>{isDetectingGps ? 'Detecting...' : 'Detect My Location'}</span>
        </button>
      </div>

      {statusError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
          <span>{statusError}</span>
        </div>
      )}

      {/* Interactive OpenStreetMap via React-Leaflet */}
      <div
        className={`w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100`}
      >
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={hasCoords ? 15 : 12}
          className="w-full h-full z-0"
          scrollWheelZoom={true}
        >
          <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
          <MapController
            center={mapCenter}
            hasCoords={hasCoords}
            onMapClick={resolveCoordinates}
          />
          {hasCoords && (
            <Marker
              ref={markerRef}
              position={[value.latitude!, value.longitude!]}
              icon={pinIcon}
              draggable={true}
              eventHandlers={markerEventHandlers}
            />
          )}
        </MapContainer>

        <div className="absolute bottom-2 left-2 z-[400] pointer-events-none max-w-[78%]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-xs">
            <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
            <span>Click anywhere on the map or drag the pin</span>
          </span>
        </div>
      </div>

      {/* Coordinates Readout */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
        {hasCoords ? (
          <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Coordinates pinned: {value.latitude!.toFixed(5)}, {value.longitude!.toFixed(5)}
          </span>
        ) : (
          <span className="text-slate-500 font-medium">
            No map pin selected yet — click the map, use Detect My Location, or search an address.
          </span>
        )}
      </div>
    </div>
  );
};
