// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { geocoding } from '@maptiler/client'
import { LocationSearch } from '../src/features/map/LocationSearch'

vi.mock('@maptiler/client', () => ({ geocoding: { forward: vi.fn() } }))
beforeEach(() => vi.stubEnv('VITE_MAPTILER_KEY', 'test-public-key'))
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks() })

describe('location selection', () => {
  it('converts address results from longitude/latitude and does not return the address', async () => {
    vi.mocked(geocoding.forward).mockResolvedValue({ features: [{ id: 'address', center: [13.405, 52.52], place_name: 'Berlin, Germany' }] } as Awaited<ReturnType<typeof geocoding.forward>>)
    const select = vi.fn()
    render(<LocationSearch onSelect={select} />)
    await userEvent.type(screen.getByLabelText('Search address'), 'Berlin')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Berlin, Germany' }))
    expect(select).toHaveBeenCalledExactlyOnceWith({ latitude: 52.52, longitude: 13.405 })
  })

  it('searches Photon without a key and selects the published Berlin coordinates', async () => {
    vi.stubEnv('VITE_MAPTILER_KEY', '')
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ features: [
      { geometry: { type: 'Point', coordinates: [13.4132, 52.5219] }, properties: { osm_type: 'N', osm_id: 123, name: 'Alexanderplatz', city: 'Berlin' } },
      { geometry: { type: 'Point', coordinates: [999, 999] }, properties: { name: 'Invalid result' } },
    ] }) })))
    const select = vi.fn()
    render(<LocationSearch onSelect={select} />)
    await userEvent.type(screen.getByLabelText('Search address'), 'Alexanderplatz Berlin')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Alexanderplatz, Berlin' }))
    expect(select).toHaveBeenCalledExactlyOnceWith({ latitude: 52.5219, longitude: 13.4132 })
    expect(geocoding.forward).not.toHaveBeenCalled()
  })

  it('distinguishes different Photon points with the same address label', async () => {
    vi.stubEnv('VITE_MAPTILER_KEY', '')
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ features: [
      { geometry: { type: 'Point', coordinates: [13.41831, 52.49899] }, properties: { name: 'Kottbusser Tor', city: 'Berlin' } },
      { geometry: { type: 'Point', coordinates: [13.41801, 52.49930] }, properties: { name: 'Kottbusser Tor', city: 'Berlin' } },
    ] }) })))
    const select = vi.fn()
    render(<LocationSearch onSelect={select} />)
    await userEvent.type(screen.getByLabelText('Search address'), 'Kottbusser Tor Berlin')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Kottbusser Tor, Berlin (52.49930, 13.41801)' }))
    expect(select).toHaveBeenCalledExactlyOnceWith({ latitude: 52.49930, longitude: 13.41801 })
  })

  it('shows a useful error when address search fails', async () => {
    vi.mocked(geocoding.forward).mockRejectedValue(new Error('Search unavailable'))
    render(<LocationSearch onSelect={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Search address'), 'Berlin')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Address search failed'))
  })

  it('ignores a search response after the query changes', async () => {
    let resolve!: (result: Awaited<ReturnType<typeof geocoding.forward>>) => void
    vi.mocked(geocoding.forward).mockImplementation(() => new Promise((done) => { resolve = done }))
    const select = vi.fn()
    render(<LocationSearch onSelect={select} />)
    await userEvent.type(screen.getByLabelText('Search address'), 'Berlin')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await userEvent.type(screen.getByLabelText('Search address'), ' Mitte')
    await act(async () => resolve({ features: [{ id: 'old', center: [13.405, 52.52], place_name: 'Old result' }] } as Awaited<ReturnType<typeof geocoding.forward>>))
    expect(screen.queryByRole('button', { name: 'Old result' })).toBeNull()
    expect(select).not.toHaveBeenCalled()
  })
})
