import { afterEach, expect, it, vi } from 'vitest'
import { searchPhoton } from '../src/lib/photon'

afterEach(() => vi.unstubAllGlobals())

it('keeps valid boundary points and rejects malformed Photon coordinates', async () => {
  const invalid = [undefined, [], [13], ['13', 52], [13, '52'], [NaN, 52], [13, Infinity], [181, 52], [13, -91]]
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ features: [
    ...invalid.map((coordinates) => ({ geometry: { type: 'Point', coordinates } })),
    { geometry: { type: 'LineString', coordinates: [13, 52] } },
    {},
    { geometry: { type: 'Point', coordinates: [180, 90] }, properties: { name: 'North' } },
    { geometry: { type: 'Point', coordinates: [-180, -90] } },
  ] }) })))
  const results = await searchPhoton('boundary')
  expect(results.map(({ center, place_name }) => ({ center, place_name }))).toEqual([
    { center: [180, 90], place_name: 'North' },
    { center: [-180, -90], place_name: 'Unnamed location' },
  ])
})
