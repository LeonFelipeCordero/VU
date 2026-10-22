// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { Map } from 'maplibre-gl'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getViewportPoints } from '../src/features/reports/data'
import { useViewportPoints, viewportBounds } from '../src/features/map/use-viewport-points'
import type { LocationReport } from '../src/lib/report'
import type { HistoricalIncident } from '../src/lib/historical-incident'

vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }))
vi.mock('../src/features/reports/data', () => ({ getViewportPoints: vi.fn() }))
const load = vi.mocked(getViewportPoints)
const reports: LocationReport[] = []
const historical: HistoricalIncident[] = []
const point = (id: number): LocationReport => ({ id, location: { latitude: 52.55, longitude: 13.4 }, description: 'Fixture', source: 'app', createdAt: 0, updatedAt: 0 })
const batch = (id: number, hasMore = false) => ({ reports: [point(id)], incidents: [], hasMore })
function mapFixture() {
  let west = 13.3
  const events = new globalThis.Map<string, () => void>()
  const instance = {
    getBounds: () => ({ getSouth: () => 52.5, getNorth: () => 52.6, getWest: () => west, getEast: () => west + 0.1 }),
    on: (event: string, callback: () => void) => events.set(event, callback),
    off: (event: string) => events.delete(event),
  } as unknown as Map
  return { ref: { current: instance }, events, move: (longitude: number) => { west = longitude; act(() => events.get('move')?.()) } }
}
afterEach(() => { cleanup(); vi.resetAllMocks() })

describe('progressive viewport loading', () => {
  it('publishes each page immediately, retains points while panning, and skips covered areas', async () => {
    let resolvePage!: (value: ReturnType<typeof batch>) => void
    load.mockResolvedValueOnce(batch(1, true)).mockImplementationOnce(() => new Promise((resolve) => { resolvePage = resolve }))
    const fixture = mapFixture()
    const { result } = renderHook(() => useViewportPoints(fixture.ref, true, reports, historical))
    await waitFor(() => expect(result.current.reports.map((report) => report.id)).toEqual([1]))
    expect(result.current.status).toBe('loading')
    expect(load.mock.calls[1][0].data).toMatchObject({ afterReport: 1, afterIncident: 0 })
    await act(async () => resolvePage(batch(2)))
    await waitFor(() => expect(result.current.status).toBe('idle'))
    fixture.move(13.301)
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 180)) })
    expect(load).toHaveBeenCalledTimes(2)
    load.mockResolvedValueOnce(batch(3))
    fixture.move(14)
    expect(result.current.reports.map((report) => report.id)).toEqual([1, 2])
    await waitFor(() => expect(result.current.reports.map((report) => report.id)).toEqual([1, 2, 3]))
  })

  it('aborts stale requests and ignores late responses after a move or unmount', async () => {
    let resolveOld!: (value: ReturnType<typeof batch>) => void
    load.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve })).mockResolvedValueOnce(batch(2))
    const fixture = mapFixture()
    const { result, unmount } = renderHook(() => useViewportPoints(fixture.ref, true, reports, historical))
    const signal = load.mock.calls[0][0].signal!
    fixture.move(14)
    await waitFor(() => expect(result.current.reports.map((report) => report.id)).toEqual([2]))
    expect(signal.aborted).toBe(true)
    await act(async () => resolveOld(batch(1)))
    expect(result.current.reports.map((report) => report.id)).toEqual([2])
    unmount()
    expect(load.mock.calls[1][0].signal!.aborted).toBe(true)
    expect(fixture.events.size).toBe(0)
  })

  it('keeps existing points on failure and retries the current viewport', async () => {
    load.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(batch(2))
    const fixture = mapFixture()
    const seed = [point(1)]
    const { result } = renderHook(() => useViewportPoints(fixture.ref, true, seed, historical))
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.reports).toEqual(seed)
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('idle'))
    expect(result.current.reports.map((report) => report.id)).toEqual([1, 2])
  })

  it('bounds point storage and asks users to zoom in for very dense views', async () => {
    let page = 0
    load.mockImplementation(async () => {
      const start = page++ * 250
      return { reports: Array.from({ length: 250 }, (_, index) => point(start + index + 1)), incidents: [], hasMore: true }
    })
    const fixture = mapFixture()
    const { result } = renderHook(() => useViewportPoints(fixture.ref, true, reports, historical))
    await waitFor(() => expect(result.current.status).toBe('limited'))
    expect(load).toHaveBeenCalledTimes(48)
    expect(result.current.reports).toHaveLength(12000)
    expect(new Set(result.current.reports.map((report) => report.id)).size).toBe(12000)
  })

  it('normalizes wrapped and world-wide map bounds', () => {
    const fixture = mapFixture()
    fixture.move(179.95)
    expect(viewportBounds(fixture.ref.current).west).toBeCloseTo(179.95)
    expect(viewportBounds(fixture.ref.current).east).toBeCloseTo(-179.95)
    fixture.ref.current.getBounds = () => ({ getSouth: () => -85, getNorth: () => 85, getWest: () => -200, getEast: () => 200 }) as ReturnType<Map['getBounds']>
    expect(viewportBounds(fixture.ref.current, 0.25)).toEqual({ south: -90, north: 90, west: -180, east: 180 })
  })
})
