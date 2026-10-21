import { createServerFn } from '@tanstack/react-start'
import { validateCoordinates, validateReport, type Coordinates, type ReportInput } from '../../lib/report'

export const getNearbyReports = createServerFn({ method: 'GET' })
  .validator((location: Coordinates) => validateCoordinates(location))
  .handler(async ({ data }) => {
    try {
      const { getReportsStore } = await import('../../db/reports.server')
      const { nearbyHistoricalIncidents } = await import('../../db/historical.server')
      const { getDatabase } = await import('../../db/database.server')
      return { status: 'ready' as const, ...getReportsStore().nearby(data), historical: nearbyHistoricalIncidents(getDatabase(), data) }
    } catch (error) {
      console.error('Failed to load reports.', error)
      return { status: 'unavailable' as const, reports: [], limited: false, historical: { incidents: [], limited: false } }
    }
  })

export const submitReport = createServerFn({ method: 'POST' })
  .validator((input: ReportInput) => validateReport(input))
  .handler(async ({ data }) => {
    try {
      const { getReportsStore } = await import('../../db/reports.server')
      return getReportsStore().createApp(data)
    } catch (error) {
      console.error('Failed to save report.', error)
      throw new Error('The report could not be saved. Try again.')
    }
  })
