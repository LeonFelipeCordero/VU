import { useEffect, useRef, useState, type RefObject } from 'react'
import type { GeoJSONSource, Map, Marker } from 'maplibre-gl'
import type { Coordinates, LocationReport } from '../../lib/report'
import { formatCoordinates } from '../../lib/location'
import { addReportLayers, expandCluster, reportFeatures } from './report-layers'

interface Props {
  center: Coordinates
  selected: Coordinates | null
  reports: LocationReport[]
  onSelect: (location: Coordinates) => void
}

export function MapPanel({ center, selected, reports, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<Map | null>(null)
  const latest = useRef({ center, reports, onSelect })
  latest.current = { center, reports, onSelect }
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const key = import.meta.env.VITE_MAPTILER_KEY

  useEffect(() => {
    if (!key || !container.current) return
    let disposed = false
    let instance: Map | null = null
    import('maplibre-gl').then((lib) => {
      if (disposed || !container.current) return
      instance = new lib.Map({
        container: container.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(key)}`,
        center: [latest.current.center.longitude, Math.max(-85, Math.min(85, latest.current.center.latitude))],
        zoom: 14,
      })
      map.current = instance
      instance.addControl(new lib.NavigationControl(), 'top-right')
      instance.on('error', () => setError('Map tiles could not load. Search or enter coordinates instead.'))
      instance.on('load', () => {
        if (!instance || disposed) return
        addReportLayers(instance, latest.current.reports)
        setReady(true)
      })
      instance.on('click', async (event) => {
        if (!instance?.getLayer('report-points')) return
        const point = instance.queryRenderedFeatures(event.point, { layers: ['report-points'] })[0]
        if (point?.geometry.type === 'Point') {
          new lib.Popup().setLngLat(event.lngLat).setText(String(point.properties.description)).addTo(instance)
          return
        }
        try {
          if (await expandCluster(instance, event)) return
          const position = event.lngLat.wrap()
          latest.current.onSelect({ latitude: position.lat, longitude: position.lng })
        } catch {
          setError('The map could not select that point. Enter coordinates instead.')
        }
      })
    }).catch(() => setError('The map could not start. Search or enter coordinates instead.'))
    return () => {
      disposed = true
      instance?.remove()
      map.current = null
    }
  }, [key])

  useEffect(() => {
    if (!ready || !map.current) return
    const source = map.current.getSource('reports') as GeoJSONSource | undefined
    source?.setData(reportFeatures(reports))
  }, [ready, reports])

  useEffect(() => {
    if (!ready || !map.current) return
    map.current.jumpTo({ center: [center.longitude, Math.max(-85, Math.min(85, center.latitude))] })
  }, [ready, center.latitude, center.longitude])

  useSelectionMarker(map, ready, selected, onSelect, setError)

  return (
    <section className="map-panel" aria-label="Report map">
      <div className="map-toolbar">
        <div><strong>Explore the area</strong><p>Reports within 1 km of {formatCoordinates(center)}</p></div>
        <span className="map-legend">● Reports <span>● Selected point</span></span>
      </div>
      <div className="map-canvas" ref={container} aria-label="Interactive map" />
      {!key && <div className="map-empty"><h2>The map needs a MapTiler key</h2><p>Set VITE_MAPTILER_KEY to enable the map and address search. You can still select a location with coordinates or your device.</p></div>}
      {key && !ready && !error && <p className="map-notice" role="status">Loading map…</p>}
      {error && <p className="map-notice" role="alert">{error}</p>}
      {Math.abs(center.latitude) > 85 && <p className="map-notice">This point is outside the map projection. The coordinates and report search are unchanged.</p>}
      {ready && <button className="map-center-button secondary" onClick={() => {
        const position = map.current?.getCenter().wrap()
        if (position) onSelect({ latitude: position.lat, longitude: position.lng })
      }}>Select map center</button>}
      <p className="map-caption">Click to select a point. Drag the green pin to adjust it. Brown circles show submitted reports, not a measure of danger.</p>
    </section>
  )
}

function useSelectionMarker(map: RefObject<Map | null>, ready: boolean, selected: Coordinates | null, onSelect: Props['onSelect'], onError: (error: string) => void) {
  const marker = useRef<Marker | null>(null)
  const select = useRef(onSelect)
  select.current = onSelect

  useEffect(() => {
    if (!ready || !selected || Math.abs(selected.latitude) > 85 || !map.current) return
    const instance = map.current
    let disposed = false
    import('maplibre-gl').then(({ Marker }) => {
      if (disposed) return
      const pin = new Marker({ color: '#386654', draggable: true })
        .setLngLat([selected.longitude, selected.latitude]).addTo(instance)
      pin.on('dragend', () => {
        const position = pin.getLngLat().wrap()
        select.current({ latitude: position.lat, longitude: position.lng })
      })
      marker.current = pin
    }).catch(() => onError('The selection pin could not load. Enter coordinates instead.'))
    return () => { disposed = true; marker.current?.remove(); marker.current = null }
  }, [map, ready, selected?.latitude, selected?.longitude, onError])
}
