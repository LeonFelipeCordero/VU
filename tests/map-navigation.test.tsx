// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Link, Outlet, RouterProvider } from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Route } from '../src/routes/index'
import { submitReport } from '../src/features/reports/data'
import type { Coordinates } from '../src/lib/report'

vi.mock('../src/features/reports/data', () => ({
  getNearbyReports: vi.fn(async () => ({ status: 'ready', reports: [], limited: false })),
  submitReport: vi.fn(async () => ({})),
}))
vi.mock('../src/features/map/MapPanel', () => ({
  MapPanel: ({ onSelect }: { onSelect: (location: Coordinates) => void }) => (
    <button onClick={() => onSelect({ latitude: 40.7128, longitude: -74.006 })}>Select New York on map</button>
  ),
}))
beforeEach(() => vi.stubGlobal('scrollTo', vi.fn()))
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks() })

async function openMap(url = '/') {
  const root = createRootRoute({ component: () => <><Link to="/">Map</Link><Outlet /></> })
  const route = createRoute({ ...Route.options, path: '/', getParentRoute: () => root })
  const router = createRouter({ routeTree: root.addChildren([route]), history: createMemoryHistory({ initialEntries: [url] }) })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { name: 'Choose a location' })
  return router
}

const submitButton = () => screen.getByRole('button', { name: 'Submit report' }) as HTMLButtonElement

describe('map selection and URL navigation', () => {
  it('starts in Berlin without device lookup or removed page sections', async () => {
    const locate = vi.fn()
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition: locate } })
    const router = await openMap()
    expect(router.state.location.search).toMatchObject({ lat: 52.52, lng: 13.405 })
    expect(locate).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Use my location' })).toBeNull()
    expect(screen.queryByText('Enter coordinates')).toBeNull()
    expect(screen.queryByRole('heading', { name: 'See a place. Share what happened.' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Historical source data' })).toBeNull()
    expect(screen.queryByText('Select a point on the map, search, or enter coordinates.')).toBeNull()
  })

  it('retains coordinates from a shared URL', async () => {
    const router = await openMap('/?lat=40.7128&lng=-74.006')
    expect(router.state.location.search).toMatchObject({ lat: 40.7128, lng: -74.006 })
  })

  it('clears an old submission point on Map navigation without discarding the draft', async () => {
    const router = await openMap()
    await userEvent.click(screen.getByRole('button', { name: 'Select New York on map' }))
    await waitFor(() => expect(router.state.location.search).toMatchObject({ lat: 40.7128, lng: -74.006 }))
    await userEvent.type(screen.getByLabelText('What happened?'), 'Keep this draft')
    expect(submitButton().disabled).toBe(false)
    await userEvent.click(screen.getByRole('link', { name: 'Map' }))
    await waitFor(() => expect(submitButton().disabled).toBe(true))
    expect(router.state.location.search).toMatchObject({ lat: 52.52, lng: 13.405 })
    expect((screen.getByLabelText('What happened?') as HTMLTextAreaElement).value).toBe('Keep this draft')
  })

  it('submits the selected map point without a coordinate display', async () => {
    await openMap()
    await userEvent.click(screen.getByRole('button', { name: 'Select New York on map' }))
    await userEvent.type(screen.getByLabelText('What happened?'), 'Road blocked')
    await userEvent.click(submitButton())
    await screen.findByText('Report submitted. Thank you.')
    expect(submitReport).toHaveBeenCalledExactlyOnceWith({ data: { location: { latitude: 40.7128, longitude: -74.006 }, description: 'Road blocked' } })
  })
})
