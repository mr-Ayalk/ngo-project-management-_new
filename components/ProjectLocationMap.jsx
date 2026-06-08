'use client';

import { getProjectMapCoords } from '@/lib/ethiopia-locations';

export default function ProjectLocationMap({ region, town, zone, woreda }) {
  const coords = getProjectMapCoords({ region, town, zone });
  const label = [town, woreda, region].filter(Boolean).join(', ') || 'Ethiopia';
  const span = coords.zoom >= 11 ? 0.06 : coords.zoom >= 9 ? 0.15 : 0.45;
  const bbox = `${coords.lng - span},${coords.lat - span * 0.7},${coords.lng + span},${coords.lat + span * 0.7}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;

  return (
    <div className="project-map-section">
      <div className="project-detail-section-title">Project Location</div>
      <p className="project-map-label">{label}</p>
      <div className="project-map-frame">
        <iframe title={`Map showing ${label}`} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
      <a
        className="project-map-link"
        href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=${coords.zoom}/${coords.lat}/${coords.lng}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open in OpenStreetMap
      </a>
    </div>
  );
}
