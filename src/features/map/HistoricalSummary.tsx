import type { HistoricalIncident } from '../../lib/historical-incident'

export function HistoricalSummary({ incidents, limited }: { incidents: HistoricalIncident[]; limited: boolean }) {
  if (!incidents.length) return null
  const datasets = [...new Map(incidents.map((incident) => [`${incident.datasetName}:${incident.datasetVersion}`, incident])).values()]
  return (
    <section className="historical-summary" aria-label="Historical source data">
      <h2>{incidents.length}{limited ? '+' : ''} historical incidents nearby</h2>
      <p>Within 1 km of the search point. Blue markers use published source coordinates, not generated locations. These are historical records, not live community reports.</p>
      {limited && <p>Showing the nearest 200 records. More may exist in this area.</p>}
      {datasets.map((dataset) => <p key={`${dataset.datasetName}:${dataset.datasetVersion}`}>
        <a href={dataset.sourceUrl} target="_blank" rel="noreferrer">{dataset.datasetName} · {dataset.datasetVersion}</a><br />
        <span className="hint">{dataset.license}</span>
      </p>)}
    </section>
  )
}
