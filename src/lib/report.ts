export type Coordinates = { latitude: number; longitude: number }
export type ReportInput = { location: Coordinates; description: string }
export type LocationReport = ReportInput & {
  id: number
  source: 'app' | 'crawler'
  createdAt: number
  updatedAt: number
}

export const MAX_DESCRIPTION_LENGTH = 2000

export function validateCoordinates(location: Coordinates): Coordinates {
  if (!location || !Number.isFinite(location.latitude) || location.latitude < -90 || location.latitude > 90) {
    throw new Error('Latitude must be a finite number between -90 and 90.')
  }
  if (!Number.isFinite(location.longitude) || location.longitude < -180 || location.longitude > 180) {
    throw new Error('Longitude must be a finite number between -180 and 180.')
  }
  return { latitude: location.latitude, longitude: location.longitude }
}

export function validateReport(input: ReportInput) {
  if (!input) throw new Error('Report is required.')
  const location = validateCoordinates(input.location)
  if (typeof input.description !== 'string' || !input.description.trim()) {
    throw new Error('Description must not be blank.')
  }
  const description = input.description.trim()
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`)
  }
  return { location, description }
}
