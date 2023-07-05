import { ReactNode, MouseEvent, useContext } from 'react'
import { RouterContext } from './Router';

function Link({ to, children }: { to: string; children: ReactNode }) {
  const routerContext = useContext(RouterContext)

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    routerContext?.setPath(to)
    history.pushState(to, '', to)
  }

  return (
    <a href={to} onClick={handleClick}>
      {children}
    </a>
  )
}

export default Link