import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react'

export const RouterContext = createContext<{ path: string; setPath: (path: string) => void} | null>(null);

function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      setPath(e.state || '/')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <RouterContext.Provider value={{ path, setPath }}>
      {children}
    </RouterContext.Provider>  
  )
}

export default Router
