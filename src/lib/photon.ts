export type AddressResult = { id: string; center: number[]; place_name: string }

type PhotonFeature = { geometry?: { type?: string; coordinates?: unknown[] }; properties?: Record<string, unknown> }

function validCoordinate(value: unknown, maximum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= maximum
}

function pointCoordinates(feature: PhotonFeature) {
  const pair = feature.geometry?.coordinates
  if (feature.geometry?.type !== 'Point' || !pair) return null
  if (!validCoordinate(pair[0], 180) || !validCoordinate(pair[1], 90)) return null
  return [pair[0], pair[1]] as [number, number]
}

function addressLabel(p: Record<string, unknown>) {
  return [p.name, [p.street, p.housenumber].filter((v) => typeof v === 'string').join(' '), p.postcode, p.city || p.town, p.state, p.country]
    .filter((value, i, values) => typeof value === 'string' && value && values.indexOf(value) === i).join(', ')
}

export async function searchPhoton(query: string): Promise<AddressResult[]> {
  const url = new URL(import.meta.env.VITE_PHOTON_URL || 'https://photon.komoot.io/api/')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '5')
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!response.ok) throw new Error('Address search unavailable.')
  const data = await response.json() as { features?: PhotonFeature[] }
  if (!Array.isArray(data.features)) throw new Error('Invalid address search response.')
  const results = data.features.flatMap((feature, index) => {
    const center = pointCoordinates(feature)
    if (!center) return []
    const p = feature.properties || {}
    return [{ id: `${p.osm_type}:${p.osm_id}:${index}`, center, place_name: addressLabel(p) || 'Unnamed location' }]
  }).slice(0, 5)
  return results.map((result) => results.filter((other) => other.place_name === result.place_name).length > 1
    ? { ...result, place_name: `${result.place_name} (${result.center[1].toFixed(5)}, ${result.center[0].toFixed(5)})` } : result)
}
