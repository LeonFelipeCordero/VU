export interface MapViewport {
  south: number
  north: number
  west: number
  east: number
}

export interface ViewportRequest extends MapViewport {
  afterReport: number
  afterIncident: number
}

export function validateViewport(input: ViewportRequest): ViewportRequest {
  const { south, north, west, east, afterReport, afterIncident } = input
  const validLatitude = Number.isFinite(south) && Number.isFinite(north) && south >= -90 && north <= 90 && south <= north
  const validLongitude = [west, east].every((value) => Number.isFinite(value) && value >= -180 && value <= 180)
  const validCursor = [afterReport, afterIncident].every((id) => Number.isSafeInteger(id) && id >= 0)
  if (![validLatitude, validLongitude, validCursor].every(Boolean)) {
    throw new Error('Invalid map viewport.')
  }
  return { south, north, west, east, afterReport, afterIncident }
}
