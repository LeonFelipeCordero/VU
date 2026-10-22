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
    await userEvent.click(await screen.findByRole('option', { name: 'Berlin, Germany' }))
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
    await userEvent.click(await screen.findByRole('option', { name: 'Alexanderplatz, Berlin' }))
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
    await userEvent.click(await screen.findByRole('option', { name: 'Kottbusser Tor, Berlin (52.49930, 13.41801)' }))
    expect(select).toHaveBeenCalledExactlyOnceWith({ latitude: 52.49930, longitude: 13.41801 })
  })

  it('shows a useful error when address search fails', async () => {
    vi.mocked(geocoding.forward).mockRejectedValue(new Error('Search unavailable'))
    render(<LocationSearch onSelect={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Search address'), 'Berlin')
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Address search failed'))
  })

  it('ignores a search response after the query changes', async () => {
    let resolve!: (result: Awaited<ReturnType<typeof geocoding.forward>>) => void
    vi.mocked(geocoding.forward).mockImplementation(() => new Promise((done) => { resolve = done }))
    const select = vi.fn()
    render(<LocationSearch onSelect={select} />)
    await userEvent.type(screen.getByLabelText('Search address'), 'Berlin')
    await waitFor(() => expect(geocoding.forward).toHaveBeenCalled())
    await userEvent.type(screen.getByLabelText('Search address'), ' Mitte')
    await act(async () => resolve({ features: [{ id: 'old', center: [13.405, 52.52], place_name: 'Old result' }] } as Awaited<ReturnType<typeof geocoding.forward>>))
    expect(screen.queryByRole('option', { name: 'Old result' })).toBeNull()
    expect(select).not.toHaveBeenCalled()
  })

  it('opens on focus, debounces typing, refreshes results, and supports keyboard selection', async () => {
    vi.mocked(geocoding.forward).mockResolvedValue({ features: [{ id: 'berlin', center: [13.405, 52.52], place_name: 'Berlin' }] } as Awaited<ReturnType<typeof geocoding.forward>>)
    const select = vi.fn()
    render(<LocationSearch onSelect={select} />)
    const input = screen.getByRole('combobox', { name: 'Search address' })
    await userEvent.click(input)
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('status').textContent).toContain('Type an address')
    expect(geocoding.forward).not.toHaveBeenCalled()
    await userEvent.type(input, 'Berlin')
    await screen.findByRole('option', { name: 'Berlin' })
    expect(geocoding.forward).toHaveBeenCalledExactlyOnceWith('Berlin', expect.any(Object))
    vi.mocked(geocoding.forward).mockResolvedValue({ features: [{ id: 'mitte', center: [13.4, 52.51], place_name: 'Berlin Mitte' }] } as Awaited<ReturnType<typeof geocoding.forward>>)
    await userEvent.type(input, ' Mitte')
    await screen.findByRole('option', { name: 'Berlin Mitte' })
    expect(geocoding.forward).toHaveBeenCalledTimes(2)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(select).toHaveBeenCalledExactlyOnceWith({ latitude: 52.51, longitude: 13.4 })
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('closes on Escape and outside focus, and does not search an empty query', async () => {
    vi.mocked(geocoding.forward).mockResolvedValue({ type: 'FeatureCollection', query: ['Unknown address'], attribution: '', features: [] })
    render(<><LocationSearch onSelect={vi.fn()} /><button>Outside</button></>)
    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'Unknown address')
    await screen.findByText('No addresses found. Try another search.')
    await userEvent.keyboard('{Escape}')
    expect(input.getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(input)
    expect(input.getAttribute('aria-expanded')).toBe('true')
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }))
    expect(input.getAttribute('aria-expanded')).toBe('false')
    await userEvent.clear(input)
    expect(screen.queryByRole('option')).toBeNull()
    expect(geocoding.forward).toHaveBeenCalledTimes(1)
  })
})
