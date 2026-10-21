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

function historicalPeriod(time: HistoricalIncident['time']) {
  const year = time?.year
  if (typeof year !== 'number' || !Number.isInteger(year) || year < 1 || year > 9999) return 'Occurrence date unspecified'
  const month = time?.month
  if (!Number.isInteger(month) || Number(month) < 1 || Number(month) > 12) return String(year)
  return `${year}-${String(month).padStart(2, '0')}`
}

export function historicalLabel(incident: HistoricalIncident) {
  const period = historicalPeriod(incident.time)
  const category = incident.category === 'traffic_collision' ? 'Road collision involving personal injury' : incident.category || 'Historical incident'
  return `${category} · ${period}\n${incident.datasetName} · release ${incident.datasetVersion}\nHistorical source record; not a community report. Exact occurrence date is unavailable.`
}
