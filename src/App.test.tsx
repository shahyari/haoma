// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { DISCLAIMER } from './app/disclaimer'
import { ErrorBoundary } from './app/ErrorBoundary'

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
    expect(screen.getByRole('link', { name: 'haoma, Home' }).getAttribute('aria-current')).toBe(
      'page',
    )
    expect(screen.getByRole('button', { name: /^Profile: Alex Morgan/ })).toBeTruthy()
    expect(screen.getByRole('contentinfo').textContent).toContain(DISCLAIMER)
  })

  it('lists the six indicators on Home, without readings or a status at first', () => {
    render(<App />)
    for (const label of [
      'Blood pressure',
      'Heart rate',
      'Blood glucose',
      'Body temperature',
      'Sleep',
      'Mood',
    ]) {
      expect(
        within(screen.getByRole('region', { name: 'Indicators' })).getByRole('link', {
          name: new RegExp(`^${label}`),
        }).textContent,
      ).toContain('No measurement')
    }
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
