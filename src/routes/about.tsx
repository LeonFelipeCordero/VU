import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({ component: About })

function About() {
  return (
    <main id="main" className="about">
      <p className="eyebrow">Vigiles Urbani</p>
      <h1>Reports, not a safety score.</h1>
      <p>This prototype collects location-based community reports. Reports are unverified. A place with no reports is not necessarily free of incidents.</p>
      <h2>Share with care</h2>
      <p>Do not include names, contact details, or other personal information. Reports and their exact coordinates are public. This service does not contact emergency services.</p>
      <h2>A smaller first version</h2>
      <p>The map shows up to 200 reports within 1 km of the search point. It does not show categories, incident dates, hot zones, or historical statistics. The creation date records submission, not when an incident happened.</p>
      <p>No legacy data has been imported. The original services remain separate during development.</p>
      <Link to="/">Return to the map</Link>
    </main>
  )
}
