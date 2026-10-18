import type { LocationReport } from '../../lib/report'
import type { GeoJSONSource, Map, MapMouseEvent } from 'maplibre-gl'

export function reportFeatures(reports: LocationReport[]) {
  return {
    type: 'FeatureCollection' as const,
    features: reports.map((report) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [report.location.longitude, report.location.latitude] },
      properties: { description: report.description },
    })),
  }
}

export function addReportLayers(map: Map, reports: LocationReport[]) {
  map.addSource('reports', { type: 'geojson', data: reportFeatures(reports), cluster: true, clusterRadius: 40 })
  map.addLayer({
    id: 'clusters', type: 'circle', source: 'reports', filter: ['has', 'point_count'],
    paint: { 'circle-color': '#77552a', 'circle-radius': 19, 'circle-stroke-width': 2, 'circle-stroke-color': '#faf8f4' },
  })
  map.addLayer({
    id: 'cluster-count', type: 'symbol', source: 'reports', filter: ['has', 'point_count'],
    layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
    paint: { 'text-color': '#faf8f4' },
  })
  map.addLayer({
    id: 'report-points', type: 'circle', source: 'reports', filter: ['!', ['has', 'point_count']],
    paint: { 'circle-color': '#77552a', 'circle-radius': 7, 'circle-stroke-width': 2, 'circle-stroke-color': '#faf8f4' },
  })
}

export async function expandCluster(map: Map, event: MapMouseEvent) {
  const feature = map.queryRenderedFeatures(event.point, { layers: ['clusters'] })[0]
  if (!feature || feature.geometry.type !== 'Point') return false
  const source = map.getSource('reports') as GeoJSONSource
  const zoom = await source.getClusterExpansionZoom(Number(feature.properties.cluster_id))
  map.jumpTo({ center: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]], zoom })
  return true
}
