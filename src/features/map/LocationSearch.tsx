import { useEffect, useRef, useState } from 'react'
import { geocoding } from '@maptiler/client'
import { searchPhoton, type AddressResult } from '../../lib/photon'
import type { Coordinates } from '../../lib/report'

export function LocationSearch({ onSelect }: { onSelect: (location: Coordinates) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AddressResult[]>([])
  const [message, setMessage] = useState('')
  const [searching, setSearching] = useState(false)
  const request = useRef(0)
  const key = import.meta.env.VITE_MAPTILER_KEY

  useEffect(() => {
    return () => { request.current++ }
  }, [])

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!query.trim()) return
    const current = ++request.current
    setSearching(true)
    setResults([])
    setMessage('')
    try {
      const features = key ? (await geocoding.forward(query.trim(), { apiKey: key, limit: 5 })).features : await searchPhoton(query.trim())
      if (current !== request.current) return
      setResults(features)
      if (features.length === 0) setMessage('No addresses found. Try another search.')
    } catch {
      if (current === request.current) setMessage('Address search failed. Try again.')
    } finally {
      if (current === request.current) setSearching(false)
    }
  }

  function select(location: Coordinates) {
    request.current++
    setSearching(false)
    setResults([])
    onSelect(location)
  }

  return (
    <section aria-labelledby="location-heading">
      <h2 id="location-heading">Choose a location</h2>
      <form onSubmit={search} className="address-search">
        <label htmlFor="address">Search address</label>
        <div className="input-action">
          <input id="address" value={query} onChange={(event) => { setQuery(event.target.value); setResults([]); request.current++; setSearching(false) }} placeholder="Street, neighborhood, or city" maxLength={200} />
          <button type="submit" disabled={searching || !query.trim()}>{searching ? 'Searching…' : 'Search'}</button>
        </div>
      </form>
      {results.length > 0 && <ul className="search-results" aria-label="Address results">{results.map((feature) => (
        <li key={feature.id}><button type="button" onClick={() => { select({ longitude: feature.center[0], latitude: feature.center[1] }); setQuery(feature.place_name); setMessage('Location selected. The address will not be saved.') }}>{feature.place_name}</button></li>
      ))}</ul>}
      <p role="status">{message}</p>
    </section>
  )
}
