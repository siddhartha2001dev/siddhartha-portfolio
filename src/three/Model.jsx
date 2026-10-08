import { Component, Suspense } from 'react'
import TechGod from './techGod/TechGod'

// If the sculpture can't load, the hero simply shows the dark background (and a console warning)
// rather than taking the page down.
class Guard extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.warn('[hero] sculpture failed to load:', err)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function Model({ tier, reduced }) {
  return (
    <Guard>
      <Suspense fallback={null}>
        <TechGod tier={tier} reduced={reduced} />
      </Suspense>
    </Guard>
  )
}
