import { useEffect, useState, type RefObject } from 'react'
import { useServerFn } from '@tanstack/react-start'
import type { Map } from 'maplibre-gl'
import type { LocationReport } from '../../lib/report'
import type { HistoricalIncident } from '../../lib/historical-incident'
import type { MapViewport } from '../../lib/map-viewport'
import { getViewportPoints } from '../reports/data'

const wrap = (longitude: number) => ((longitude + 180) % 360 + 360) % 360 - 180

export function viewportBounds(map: Map, padding = 0): MapViewport {
  const bounds = map.getBounds()
  const latitudePadding = (bounds.getNorth() - bounds.getSouth()) * padding
  const longitudePadding = (bounds.getEast() - bounds.getWest()) * padding
  const west = bounds.getWest() - longitudePadding
  const east = bounds.getEast() + longitudePadding
  return {
    south: Math.max(-90, bounds.getSouth() - latitudePadding),
    north: Math.min(90, bounds.getNorth() + latitudePadding),
    west: east - west >= 360 ? -180 : wrap(west),
    east: east - west >= 360 ? 180 : wrap(east),
  }
}

function contains(outer: MapViewport, inner: MapViewport) {
  return outer.south <= inner.south && outer.north >= inner.north
    && outer.west <= outer.east && inner.west <= inner.east
    && outer.west <= inner.west && outer.east >= inner.east
}

function isCovered(visible: MapViewport, covered?: MapViewport, pending?: MapViewport) {
  return (covered && contains(covered, visible)) || (pending && contains(pending, visible))
}

function merge<T extends { id: number }>(previous: T[], incoming: T[]) {
  const points = new globalThis.Map(previous.map((point) => [point.id, point]))
  for (const point of incoming) { points.delete(point.id); points.set(point.id, point) }
  return [...points.values()].slice(-12000)
}

async function streamPoints(load: (...args: Parameters<typeof getViewportPoints>) => ReturnType<typeof getViewportPoints>, bounds: MapViewport, signal: AbortSignal,
  publish: (batch: Awaited<ReturnType<typeof getViewportPoints>>) => void) {
  let afterReport = 0
  let afterIncident = 0
  let count = 0
  let hasMore = true
  while (hasMore) {
    const batch = await load({ data: { ...bounds, afterReport, afterIncident }, signal })
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
    publish(batch)
    afterReport = Math.max(afterReport, ...batch.reports.map((point) => point.id))
    afterIncident = Math.max(afterIncident, ...batch.incidents.map((point) => point.id))
    count += Math.max(batch.reports.length, batch.incidents.length)
    if (count >= 12000 && batch.hasMore) return 'limited' as const
    hasMore = batch.hasMore
  }
  return 'idle' as const
}

export function useViewportPoints(map: RefObject<Map | null>, ready: boolean, reports: LocationReport[], historical: HistoricalIncident[]) {
  const load = useServerFn(getViewportPoints)
  const [points, setPoints] = useState({ reports, historical })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'limited'>('idle')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    setPoints((previous) => ({ reports: merge(previous.reports, reports), historical: merge(previous.historical, historical) }))
    if (!ready || !map.current) return
    const instance = map.current
    let controller: AbortController | undefined
    let covered: MapViewport | undefined
    let pending: MapViewport | undefined
    let timer: ReturnType<typeof setTimeout> | undefined

    async function refresh() {
      const visible = viewportBounds(instance)
      if (isCovered(visible, covered, pending)) return
      controller?.abort()
      const request = new AbortController()
      controller = request
      const bounds = viewportBounds(instance, 0.25)
      pending = bounds
      setStatus('loading')
      try {
        const result = await streamPoints(load, bounds, request.signal, (batch) => {
          setPoints((previous) => ({ reports: merge(previous.reports, batch.reports), historical: merge(previous.historical, batch.incidents) }))
        })
        if (request.signal.aborted) return
        if (result === 'idle') covered = bounds
        setStatus(result)
      } catch {
        if (!request.signal.aborted) setStatus('error')
      } finally {
        if (controller === request) pending = undefined
      }
    }

    const schedule = () => {
      if (timer) return
      timer = setTimeout(() => { timer = undefined; void refresh() }, 150)
    }
    instance.on('move', schedule)
    instance.on('moveend', schedule)
    void refresh()
    return () => {
      clearTimeout(timer)
      controller?.abort()
      instance.off('move', schedule)
      instance.off('moveend', schedule)
    }
  }, [map, ready, reports, historical, load, retry])

  return { ...points, status, retry: () => setRetry((value) => value + 1) }
}
