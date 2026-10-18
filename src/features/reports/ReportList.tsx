import type { LocationReport } from '../../lib/report'
import { formatCoordinates } from '../../lib/location'

export function ReportList({ reports, limited, available }: { reports: LocationReport[]; limited: boolean; available: boolean }) {
  return (
    <section aria-labelledby="nearby-heading" className="nearby-section">
      <div className="section-heading"><h2 id="nearby-heading">Nearby reports</h2><span>{reports.length}{limited ? '+' : ''}</span></div>
      <p className="hint">Within 1 km of the search point. Reports are unverified.</p>
      {limited && <p role="status">Showing the nearest 200 reports. Other reports may exist in this area.</p>}
      {!available ? <p>Reports are unavailable. This does not mean there are no reports.</p> : reports.length === 0 && <p>No reports found here. This does not mean the area is free of incidents.</p>}
      <ol className="report-list">
        {reports.map((report) => (
          <li key={report.id}>
            <p className="report-description">{report.description}</p>
            <p className="hint">{formatCoordinates(report.location)} · {report.source === 'app' ? 'Community submission' : 'Crawler submission'}</p>
            <time dateTime={new Date(report.createdAt).toISOString()}>Submitted {new Date(report.createdAt).toISOString().slice(0, 10)} (UTC)</time>
          </li>
        ))}
      </ol>
    </section>
  )
}
