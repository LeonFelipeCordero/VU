// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ReportForm } from '../src/features/reports/ReportForm'

const location = { latitude: 52.52, longitude: 13.405 }
afterEach(cleanup)

describe('report submission flow', () => {
  it('requires a selected location before submission', async () => {
    const submit = vi.fn()
    render(<ReportForm location={null} enabled onSubmit={submit} onSaved={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('What happened?'), 'Report text')
    expect((screen.getByRole('button', { name: 'Submit report' }) as HTMLButtonElement).disabled).toBe(true)
    expect(submit).not.toHaveBeenCalled()
  })

  it('submits trimmed text and named coordinates, then clears the draft', async () => {
    const submit = vi.fn().mockResolvedValue('id')
    const saved = vi.fn()
    render(<ReportForm location={location} enabled onSubmit={submit} onSaved={saved} />)
    await userEvent.type(screen.getByLabelText('What happened?'), '  Broken street light  ')
    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }))
    expect(submit).toHaveBeenCalledExactlyOnceWith({ location, description: 'Broken street light' })
    expect(saved).toHaveBeenCalledOnce()
    expect(screen.getByRole('status').textContent).toContain('Report submitted')
    expect((screen.getByLabelText('What happened?') as HTMLTextAreaElement).value).toBe('')
  })

  it('preserves the draft when submission fails and permits retry', async () => {
    const submit = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce('id')
    render(<ReportForm location={location} enabled onSubmit={submit} onSaved={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('What happened?'), 'Keep this text')
    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }))
    expect(screen.getByRole('alert').textContent).toContain('could not be submitted')
    expect((screen.getByLabelText('What happened?') as HTMLTextAreaElement).value).toBe('Keep this text')
    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Report submitted'))
    expect(submit).toHaveBeenCalledTimes(2)
  })

  it('blocks duplicate submissions while a save is pending', async () => {
    let finish!: () => void
    const submit = vi.fn(() => new Promise<void>((resolve) => { finish = resolve }))
    render(<ReportForm location={location} enabled onSubmit={submit} onSaved={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('What happened?'), 'Report')
    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }))
    const button = screen.getByRole('button', { name: 'Submitting…' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    await userEvent.click(button)
    expect(submit).toHaveBeenCalledOnce()
    finish()
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Report submitted'))
  })
})
