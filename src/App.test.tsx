// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { DISCLAIMER } from './app/disclaimer'
import { ErrorBoundary } from './app/ErrorBoundary'
import { STORAGE_KEY } from './storage/storage'

afterEach(() => {
  cleanup()
  window.history.pushState({}, '', '/')
})

describe('App shell', () => {
  it('renders the landmarks, skip link, navigation, and canonical disclaimer', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'Skip to main content' }).getAttribute('href')).toBe(
      '#main',
    )
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy()
    expect(screen.getByRole('main').id).toBe('main')
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Haoma, Home' }).getAttribute('aria-current')).toBe(
      'page',
    )
    expect(screen.getByRole('button', { name: /^Profile: Alex Morgan/ })).toBeTruthy()
    expect(screen.getByRole('contentinfo').textContent).toContain(DISCLAIMER)
  })

  it('loads the simulated demo history on a first visit and lists the six indicators', () => {
    localStorage.clear()
    render(<App />)
    const indicators = within(screen.getByRole('region', { name: 'Indicators' }))
    for (const label of [
      'Blood pressure',
      'Heart rate',
      'Blood glucose',
      'Body temperature',
      'Sleep',
      'Mood',
    ]) {
      expect(
        indicators.getByRole('link', { name: new RegExp(`^${label}`) }).textContent,
      ).not.toContain('No measurement')
    }
    expect(screen.getByText('Demo data')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).entries.length).toBeGreaterThan(0)
  })

  it('shows a not-found page for unknown routes', () => {
    window.history.pushState({}, '', '/nope')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy()
  })
})

describe('ErrorBoundary', () => {
  it('shows a recoverable error message when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const Broken = () => {
      throw new Error('boom')
    }
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert').textContent).toContain('Something went wrong')
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy()
  })
})
