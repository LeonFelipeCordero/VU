import { useEffect, useRef, useState, type RefObject } from 'react'
import { geocoding, type GeocodingFeature } from '@maptiler/client'
import type { Coordinates } from '../../lib/report'

export function LocationSearch({ onSelect, selectionRevision }: { onSelect: (location: Coordinates) => void; selectionRevision?: RefObject<number> }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingFeature[]>([])
  const [message, setMessage] = useState('')
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const request = useRef(0)
  const mounted = useRef(true)
  const key = import.meta.env.VITE_MAPTILER_KEY

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; request.current++ }
  }, [])

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!query.trim() || !key) return
    const current = ++request.current
    setLocating(false)
    setSearching(true)
    setResults([])
    setMessage('')
    try {
      const response = await geocoding.forward(query.trim(), { apiKey: key, limit: 5 })
      if (current !== request.current) return
      setResults(response.features)
      if (response.features.length === 0) setMessage('No addresses found. Try another search or enter coordinates.')
    } catch {
      if (current === request.current) setMessage('Address search failed. Try again or enter coordinates.')
    } finally {
      if (current === request.current) setSearching(false)
    }
  }

  function select(location: Coordinates) {
    request.current++
    setSearching(false)
    setLocating(false)
    setResults([])
    onSelect(location)
  }

  function locate() {
    const revision = selectionRevision?.current
    const current = ++request.current
    setSearching(false)
    setResults([])
    setMessage('')
    if (!navigator.geolocation) return setMessage('Device location is unavailable. Search or enter coordinates instead.')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!mounted.current || current !== request.current) return
        setLocating(false)
        if (revision !== selectionRevision?.current) return
        select({ latitude: coords.latitude, longitude: coords.longitude })
      },
      (error) => {
        if (!mounted.current || current !== request.current) return
        setLocating(false)
        if (revision !== selectionRevision?.current) return
        setMessage(error.code === 1 ? 'Location permission was denied. Search or enter coordinates instead.' : 'Your device location could not be found. Try search or coordinates.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <section aria-labelledby="location-heading">
      <h2 id="location-heading">Choose a location</h2>
      <form onSubmit={search} className="address-search">
        <label htmlFor="address">Search address</label>
        <div className="input-action">
          <input id="address" value={query} onChange={(event) => { setQuery(event.target.value); setResults([]); request.current++; setSearching(false); setLocating(false) }} placeholder="Street, neighborhood, or city" maxLength={200} disabled={!key} />
          <button type="submit" disabled={!key || searching || !query.trim()}>{searching ? 'Searching…' : 'Search'}</button>
        </div>
      </form>
      {!key && <p className="hint">Address search needs a MapTiler key. You can enter coordinates below.</p>}
      {results.length > 0 && <ul className="search-results" aria-label="Address results">{results.map((feature) => (
        <li key={feature.id}><button type="button" onClick={() => { select({ longitude: feature.center[0], latitude: feature.center[1] }); setQuery(feature.place_name); setMessage('Location selected. The address will not be saved.') }}>{feature.place_name}</button></li>
      ))}</ul>}
      <button type="button" className="secondary" onClick={locate} disabled={locating}>{locating ? 'Finding location…' : 'Use my location'}</button>
      <p role="status">{message}</p>
      <CoordinateEntry onSelect={select} />
    </section>
  )
}

function CoordinateEntry({ onSelect }: { onSelect: (location: Coordinates) => void }) {
  return (
    <details className="coordinate-entry">
      <summary>Enter coordinates</summary>
      <form onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        onSelect({ latitude: Number(data.get('latitude')), longitude: Number(data.get('longitude')) })
      }}>
        <label htmlFor="latitude">Latitude</label><input id="latitude" name="latitude" type="number" min={-90} max={90} step="any" required />
        <label htmlFor="longitude">Longitude</label><input id="longitude" name="longitude" type="number" min={-180} max={180} step="any" required />
        <button type="submit" className="secondary">Select coordinates</button>
      </form>
    </details>
  )
}
