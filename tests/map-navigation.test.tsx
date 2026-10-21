// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Link, Outlet, RouterProvider } from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Route } from '../src/routes/index'
import type { Coordinates } from '../src/lib/report'

vi.mock('../src/features/reports/data', () => ({
  getNearbyReports: vi.fn(async () => ({ status: 'ready', reports: [], limited: false })),
  submitReport: vi.fn(),
}))
vi.mock('../src/features/map/MapPanel', () => ({
  MapPanel: ({ onSelect }: { onSelect: (location: Coordinates) => void }) => (
    <button onClick={() => onSelect({ latitude: 40.7128, longitude: -74.006 })}>Select New York on map</button>
  ),
}))
beforeEach(() => vi.stubGlobal('scrollTo', vi.fn()))
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

async function openMap(url = '/') {
  const root = createRootRoute({ component: () => <><Link to="/">Map</Link><Outlet /></> })
  const route = createRoute({ ...Route.options, path: '/', getParentRoute: () => root })
  const router = createRouter({ routeTree: root.addChildren([route]), history: createMemoryHistory({ initialEntries: [url] }) })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { name: 'See a place. Share what happened.' })
  return router
}

describe('map selection and URL navigation', () => {
  it('uses device location automatically and removes the nearby reports box', async () => {
    let resolve!: PositionCallback
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition: vi.fn((success: PositionCallback) => { resolve = success }) } })
    const router = await openMap()
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledOnce()
    act(() => resolve({ coords: { latitude: 52.52, longitude: 13.405 } } as GeolocationPosition))
    await waitFor(() => expect(router.state.location.search).toMatchObject({ lat: 52.52, lng: 13.405 }))
    expect(screen.queryByRole('heading', { name: 'Nearby reports' })).toBeNull()
  })

  it('does not replace coordinates from a shared URL with device location', async () => {
    const locate = vi.fn()
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition: locate } })
    const router = await openMap('/?lat=52.52&lng=13.405')
    expect(router.state.location.search).toMatchObject({ lat: 52.52, lng: 13.405 })
    expect(locate).not.toHaveBeenCalled()
  })

  it('clears an old submission point on Map navigation without discarding the draft', async () => {
    const router = await openMap()
    await userEvent.click(screen.getByRole('button', { name: 'Select New York on map' }))
    await waitFor(() => expect(router.state.location.search).toMatchObject({ lat: 40.7128, lng: -74.006 }))
    await userEvent.type(screen.getByLabelText('What happened?'), 'Keep this draft')
    expect((screen.getByRole('button', { name: 'Submit report' }) as HTMLButtonElement).disabled).toBe(false)
    await userEvent.click(screen.getByRole('link', { name: 'Map' }))
    await screen.findByText('Select a point on the map, search, or enter coordinates.')
    expect(router.state.location.search).toMatchObject({ lat: 0, lng: 0 })
    expect((screen.getByRole('button', { name: 'Submit report' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByLabelText('What happened?') as HTMLTextAreaElement).value).toBe('Keep this draft')
  })

  it('ignores delayed device location after a newer map selection', async () => {
    let resolve!: PositionCallback
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition: (success: PositionCallback) => { resolve = success } } })
    const router = await openMap()
    expect(screen.getByRole('button', { name: 'Finding location…' })).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Select New York on map' }))
    await waitFor(() => expect(router.state.location.search).toMatchObject({ lat: 40.7128, lng: -74.006 }))
    act(() => resolve({ coords: { latitude: 10, longitude: 20 } } as GeolocationPosition))
    expect(router.state.location.search).toMatchObject({ lat: 40.7128, lng: -74.006 })
    expect(screen.getByText('40.71280, -74.00600')).toBeTruthy()
  })
})
