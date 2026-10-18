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
    vi.mocked(geocoding.forward).mockResolvedValue({ features: [{ id: 'address', center: [-106.0738, 28.64], place_name: 'Chihuahua, Mexico' }] } as Awaited<ReturnType<typeof geocoding.forward>>)
    const select = vi.fn()
    render(<LocationSearch onSelect={select} />)
    await userEvent.type(screen.getByLabelText('Search address'), 'Chihuahua')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Chihuahua, Mexico' }))
    expect(select).toHaveBeenCalledExactlyOnceWith({ latitude: 28.64, longitude: -106.0738 })
  })

  it('shows a useful error when address search fails', async () => {
    vi.mocked(geocoding.forward).mockRejectedValue(new Error('Search unavailable'))
    render(<LocationSearch onSelect={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Search address'), 'Chihuahua')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Address search failed'))
  })

  it('handles denied geolocation without selecting a default point', async () => {
    const select = vi.fn()
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition: (_success: unknown, error: (value: { code: number }) => void) => error({ code: 1 }) } })
    render(<LocationSearch onSelect={select} />)
    await userEvent.click(screen.getByRole('button', { name: 'Use my location' }))
    expect(screen.getByRole('status').textContent).toContain('permission was denied')
    expect(select).not.toHaveBeenCalled()
  })

  it('does not let a late device result replace manually selected coordinates', async () => {
    let resolve!: PositionCallback
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition: (success: PositionCallback) => { resolve = success } } })
    const select = vi.fn()
    render(<LocationSearch onSelect={select} />)
    await userEvent.click(screen.getByRole('button', { name: 'Use my location' }))
    await userEvent.click(screen.getByText('Enter coordinates'))
    await userEvent.type(screen.getByLabelText('Latitude'), '28.64')
    await userEvent.type(screen.getByLabelText('Longitude'), '-106.0738')
    await userEvent.click(screen.getByRole('button', { name: 'Select coordinates' }))
    act(() => resolve({ coords: { latitude: 10, longitude: 20 } } as GeolocationPosition))
    expect(select).toHaveBeenCalledExactlyOnceWith({ latitude: 28.64, longitude: -106.0738 })
  })

  it('offers a keyboard-accessible selection when maps are not configured', async () => {
    vi.stubEnv('VITE_MAPTILER_KEY', '')
    const select = vi.fn()
    render(<LocationSearch onSelect={select} />)
    await userEvent.click(screen.getByText('Enter coordinates'))
    await userEvent.type(screen.getByLabelText('Latitude'), '28.64')
    await userEvent.type(screen.getByLabelText('Longitude'), '-106.0738')
    await userEvent.click(screen.getByRole('button', { name: 'Select coordinates' }))
    expect(select).toHaveBeenCalledExactlyOnceWith({ latitude: 28.64, longitude: -106.0738 })
  })
})
