import type { Map } from 'maplibre-gl'
import { historicalLabel, type HistoricalIncident } from '../../lib/historical-incident'

export function historicalFeatures(incidents: HistoricalIncident[]) {
  return {
    type: 'FeatureCollection' as const,
    features: incidents.map((incident) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [incident.longitude, incident.latitude] },
      properties: { description: historicalLabel(incident) },
    })),
  }
}

export function addHistoricalLayer(map: Map, incidents: HistoricalIncident[]) {
  map.addSource('historical-incidents', { type: 'geojson', data: historicalFeatures(incidents) })
  map.addLayer({
    id: 'historical-points', type: 'circle', source: 'historical-incidents',
    paint: { 'circle-color': '#305b91', 'circle-radius': 6, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#fff' },
  })
}
