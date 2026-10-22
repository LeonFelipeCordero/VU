import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { geocoding } from '@maptiler/client'
import { searchPhoton, type AddressResult } from '../../lib/photon'
import type { Coordinates } from '../../lib/report'

export function LocationSearch({ onSelect }: { onSelect: (location: Coordinates) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AddressResult[]>([])
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const request = useRef(0)
  const key = import.meta.env.VITE_MAPTILER_KEY

  useEffect(() => {
    if (!open || !query.trim()) return
    const current = ++request.current
    const timer = setTimeout(async () => {
      setMessage('Searching…')
      try {
        const features = key ? (await geocoding.forward(query.trim(), { apiKey: key, limit: 5 })).features : await searchPhoton(query.trim())
        if (current !== request.current) return
        setResults(features)
        setMessage(features.length ? `${features.length} addresses found.` : 'No addresses found. Try another search.')
      } catch {
        if (current === request.current) setMessage('Address search failed. Try again.')
      }
    }, 300)
    return () => { clearTimeout(timer); request.current++ }
  }, [query, open, key])

  function close() {
    request.current++
    setOpen(false)
    setActive(-1)
  }

  function select(feature: AddressResult) {
    close()
    setQuery(feature.place_name)
    setResults([])
    setMessage('Location selected. The address will not be saved.')
    onSelect({ longitude: feature.center[0], latitude: feature.center[1] })
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') return close()
    if (event.key === 'Enter') {
      event.preventDefault()
      if (open && results[active]) select(results[active])
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setActive((index) => {
        if (!results.length) return -1
        if (index < 0) return event.key === 'ArrowDown' ? 0 : results.length - 1
        return (index + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length
      })
    }
  }

  return (
    <section aria-labelledby="location-heading">
      <h2 id="location-heading">Choose a location</h2>
      <div className="address-search">
        <label htmlFor="address">Search address</label>
        <input id="address" role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls="address-results"
          aria-activedescendant={open && active >= 0 ? `address-result-${active}` : undefined}
          autoComplete="off" value={query} onFocus={() => { setOpen(true); setMessage('') }} onClick={() => setOpen(true)} onBlur={close} onKeyDown={keyDown}
          onChange={(event) => {
            request.current++
            setQuery(event.target.value)
            setResults([])
            setActive(-1)
            setMessage('')
            setOpen(true)
          }} placeholder="Street, neighborhood, or city" maxLength={200} />
        {open && <div className="address-dropdown">
          <ul id="address-results" className="search-results" role="listbox" aria-label="Address results">
            {results.map((feature, index) => (
              <li key={feature.id} id={`address-result-${index}`} role="option" aria-selected={active === index}
                onMouseDown={(event) => event.preventDefault()} onClick={() => select(feature)}>{feature.place_name}</li>
            ))}
          </ul>
          <p role="status" className="hint">{message || (query.trim() ? 'Waiting to search…' : 'Type an address to search.')}</p>
        </div>}
      </div>
      {!open && <p role="status">{message}</p>}
    </section>
  )
}
