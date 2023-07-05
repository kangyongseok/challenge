import type { ReactNode } from 'react'

function Route({ path, component }: { path: string; component: ReactNode }) {
  if (path === window.location.pathname) {
    return (
      <div>
        {component}
      </div>
    )
  }
  return null
}

export default Route
