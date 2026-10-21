export type AddressResult = { id: string; center: number[]; place_name: string }

type PhotonFeature = { geometry?: { type?: string; coordinates?: unknown[] }; properties?: Record<string, unknown> }

export async function searchPhoton(query: string): Promise<AddressResult[]> {
  const url = new URL(import.meta.env.VITE_PHOTON_URL || 'https://photon.komoot.io/api/')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '5')
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!response.ok) throw new Error('Address search unavailable.')
  const data = await response.json() as { features?: PhotonFeature[] }
  if (!Array.isArray(data.features)) throw new Error('Invalid address search response.')
  const results = data.features.flatMap((feature, index) => {
    const pair = feature.geometry?.coordinates
    if (feature.geometry?.type !== 'Point' || !pair || typeof pair[0] !== 'number' || typeof pair[1] !== 'number'
      || !Number.isFinite(pair[0]) || !Number.isFinite(pair[1]) || Math.abs(pair[0]) > 180 || Math.abs(pair[1]) > 90) return []
    const p = feature.properties || {}
    const label = [p.name, [p.street, p.housenumber].filter((v) => typeof v === 'string').join(' '), p.postcode, p.city || p.town, p.state, p.country]
      .filter((value, i, values) => typeof value === 'string' && value && values.indexOf(value) === i).join(', ')
    return [{ id: `${p.osm_type}:${p.osm_id}:${index}`, center: [pair[0], pair[1]] as [number, number], place_name: label || 'Unnamed location' }]
  }).slice(0, 5)
  return results.map((result) => results.filter((other) => other.place_name === result.place_name).length > 1
    ? { ...result, place_name: `${result.place_name} (${result.center[1].toFixed(5)}, ${result.center[0].toFixed(5)})` } : result)
}
