import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCATION, formatCoordinates, parseLocationSearch } from '../src/lib/location'
import { reportFeatures } from '../src/features/map/report-layers'
import type { LocationReport } from '../src/lib/report'

describe('location URL state', () => {
  it('retains longitude and latitude without reversing them', () => {
    expect(parseLocationSearch({ lat: '28.64', lng: '-106.0738' })).toEqual({ lat: 28.64, lng: -106.0738 })
    expect(formatCoordinates(DEFAULT_LOCATION)).toBe('28.64000, -106.07380')
  })

  it.each([NaN, Infinity, '', null, {}, [], 'not-a-number', 999])('uses the navigation default for invalid values: %s', (value) => {
    expect(parseLocationSearch({ lat: value, lng: value })).toEqual({ lat: DEFAULT_LOCATION.latitude, lng: DEFAULT_LOCATION.longitude })
  })

  it('accepts the coordinate boundaries', () => {
    expect(parseLocationSearch({ lat: -90, lng: 180 })).toEqual({ lat: -90, lng: 180 })
  })

  it('converts stored named coordinates to GeoJSON longitude, latitude order', () => {
    const report: LocationReport = { id: 1, location: DEFAULT_LOCATION, description: '<script>not HTML</script>', source: 'app', createdAt: 0, updatedAt: 0 }
    const collection = reportFeatures([report])
    expect(collection.features[0].geometry.coordinates).toEqual([-106.0738, 28.64])
    expect(collection.features[0].properties.description).toBe(report.description)
  })
})
