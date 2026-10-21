import { useRef, useState } from 'react'
import type { Coordinates } from '../../lib/report'
import { MAX_DESCRIPTION_LENGTH, validateReport } from '../../lib/report'

interface Props {
  location: Coordinates | null
  enabled: boolean
  onSubmit: (input: { location: Coordinates; description: string }) => Promise<unknown>
  onSaved: () => void
}

export function ReportForm({ location, enabled, onSubmit, onSaved }: Props) {
  const [description, setDescription] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const submitting = useRef(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || !enabled) return
    setMessage('')
    setError('')
    if (!location) return setError('Select a location first.')
    try {
      const input = validateReport({ location, description })
      submitting.current = true
      setPending(true)
      await onSubmit(input)
      setDescription('')
      setMessage('Report submitted. Thank you.')
      onSaved()
    } catch {
      setError('The report could not be submitted. Check the location and description, then try again. Your text is still here.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <section aria-labelledby="report-heading" className="report-section">
      <h2 id="report-heading">Add a report</h2>
      <form onSubmit={submit}>
        <label htmlFor="description">What happened?</label>
        <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={MAX_DESCRIPTION_LENGTH} rows={4} required disabled={pending} aria-describedby="report-help" />
        <p id="report-help" className="hint">No names or personal details. Your report and exact coordinates will be public. Maximum {MAX_DESCRIPTION_LENGTH.toLocaleString('en')} characters.</p>
        <button type="submit" disabled={!enabled || pending || !location || !description.trim()}>{pending ? 'Submitting…' : 'Submit report'}</button>
        {!enabled && <p className="hint">Submission is unavailable until the database connection is ready.</p>}
        <p role="status">{message}</p>
        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  )
}
