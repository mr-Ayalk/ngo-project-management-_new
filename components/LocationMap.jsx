'use client';

import { getLocationCoords } from '@/lib/ethiopia-locations';

export default function LocationMap({ region, zone, town, woreda }) {
  const coords = getLocationCoords(region, town, zone);
  const label = [town, woreda, zone, region].filter(Boolean).join(', ') || 'Select a region to preview';

  if (!coords) {
    return (
      <div className="location-map location-map-empty">
        <div className="location-map-placeholder">
          <span className="location-map-pin" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <p>Select a region or town to preview the project location on the map.</p>
        </div>
      </div>
    );
  }

  const pad = 0.35;
  const bbox = `${coords.lng - pad},${coords.lat - pad},${coords.lng + pad},${coords.lat + pad}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;

  return (
    <div className="location-map">
      <div className="location-map-header">
        <span className="location-map-label">{label}</span>
        <span className="location-map-coords">{coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E</span>
      </div>
      <iframe
        title={`Map of ${label}`}
        className="location-map-frame"
        src={src}
        loading="lazy"
      />
    </div>
  );
}
