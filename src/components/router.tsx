import type { ReactNode } from 'react'

function Router({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  )
}

export default Router
