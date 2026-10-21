export type HistoricalIncident = {
  id: number
  latitude: number
  longitude: number
  category: string | null
  datasetName: string
  datasetVersion: string
  sourceUrl: string
  license: string
  time: { year?: number; month?: number } | null
}

export function historicalLabel(incident: HistoricalIncident) {
  const year = incident.time?.year
  const month = incident.time?.month
  const knownYear = typeof year === 'number' && Number.isInteger(year) && year >= 1 && year <= 9999
  const period = knownYear && Number.isInteger(month) && Number(month) >= 1 && Number(month) <= 12
    ? `${year}-${String(month).padStart(2, '0')}` : knownYear ? String(year) : 'Occurrence date unspecified'
  const category = incident.category === 'traffic_collision' ? 'Road collision involving personal injury' : incident.category || 'Historical incident'
  return `${category} · ${period}\n${incident.datasetName} · release ${incident.datasetVersion}\nHistorical source record; not a community report. Exact occurrence date is unavailable.`
}
