import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ComingSoonPage } from './ComingSoonPage'

describe('ComingSoonPage', () => {
  const defaultProps = {
    featureName: 'Courses',
    icon: 'school',
    description: 'Browse and manage all your courses in one place.',
  }

  it('renders the feature name', () => {
    const html = renderToStaticMarkup(<ComingSoonPage {...defaultProps} />)
    expect(html).toContain('Courses')
  })

  it('renders "Coming Soon" heading', () => {
    const html = renderToStaticMarkup(<ComingSoonPage {...defaultProps} />)
    expect(html).toContain('Coming Soon')
  })

  it('renders the description', () => {
    const html = renderToStaticMarkup(<ComingSoonPage {...defaultProps} />)
    expect(html).toContain(defaultProps.description)
  })

  it('renders a Notify me button', () => {
    const html = renderToStaticMarkup(<ComingSoonPage {...defaultProps} />)
    expect(html).toContain('Notify me')
  })

  it('renders the correct feature name for a different page', () => {
    const html = renderToStaticMarkup(
      <ComingSoonPage featureName="Gradebook" icon="analytics" description="Track student grades." />,
    )
    expect(html).toContain('Gradebook')
    expect(html).toContain('Coming Soon')
    expect(html).toContain('Notify me')
  })
})
