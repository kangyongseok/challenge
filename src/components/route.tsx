import { useContext } from 'react'
import { RouterContext } from './Router';

function Route({ path, component }: { path: string; component: JSX.Element }) {
  const routerContext = useContext(RouterContext)
  if (path === routerContext?.path) {
    return component
  }
  return null
}

export default Route
