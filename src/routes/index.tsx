import { createFileRoute, useRouter, type SearchSchemaInput } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useRef, useState } from 'react'
import { LocationSearch } from '../features/map/LocationSearch'
import { MapPanel } from '../features/map/MapPanel'
import { HistoricalSummary } from '../features/map/HistoricalSummary'
import { ReportForm } from '../features/reports/ReportForm'
import { ReportList } from '../features/reports/ReportList'
import { getNearbyReports, submitReport } from '../features/reports/data'
import { parseLocationSearch } from '../lib/location'
import type { Coordinates } from '../lib/report'

export const Route = createFileRoute('/')({
  validateSearch: (search: SearchSchemaInput & { lat?: unknown; lng?: unknown }) => parseLocationSearch(search),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getNearbyReports({ data: { latitude: deps.lat, longitude: deps.lng } }),
  component: MapPage,
})

function MapPage() {
  const data = Route.useLoaderData()
  const { lat, lng } = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const saveReport = useServerFn(submitReport)
  const [selection, setSelection] = useState<Coordinates | null>(null)
  const selectionRevision = useRef(0)
  const center = { latitude: lat, longitude: lng }
  const selected = selection?.latitude === lat && selection.longitude === lng ? selection : null

  useEffect(() => {
    selectionRevision.current++
    setSelection((current) => current?.latitude === lat && current.longitude === lng ? current : null)
  }, [lat, lng])

  function select(location: Coordinates) {
    selectionRevision.current++
    setSelection(location)
    void navigate({ search: { lat: location.latitude, lng: location.longitude }, replace: true })
  }

  return (
    <main id="main">
      <div className="page-intro"><div><p className="eyebrow">Your surroundings, reported by people</p><h1>See a place. Share what happened.</h1></div><p>Community reports are unverified.<br />For emergencies, contact local emergency services.</p></div>
      {data.status === 'unavailable' && <p className="connection-notice" role="alert">Reports could not load. Your selected location and draft are still here. <button className="text-button" onClick={() => void router.invalidate()}>Retry connection</button></p>}
      <div className="workspace">
        <aside className="selection-panel" aria-label="Location and report form">
          <LocationSearch onSelect={select} selectionRevision={selectionRevision} />
          <ReportForm location={selected} enabled={data.status === 'ready'} onSubmit={(input) => saveReport({ data: input })} onSaved={() => { void router.invalidate() }} />
        </aside>
        <div className="map-and-reports">
          <MapPanel center={center} selected={selected} reports={data.reports} historical={data.historical?.incidents} onSelect={select} />
          <HistoricalSummary incidents={data.historical?.incidents ?? []} limited={data.historical?.limited ?? false} />
          <ReportList reports={data.reports} limited={data.limited} available={data.status === 'ready'} />
        </div>
      </div>
    </main>
  )
}
