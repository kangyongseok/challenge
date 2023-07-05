import { useContext } from "react"
import { RouterContext } from "../components/Router"

function useRouter() {
  const routerContext = useContext(RouterContext)
  
  const push = (path: string) => {
    history.pushState(path, '', path)
    routerContext?.setPath(path)
  }

  return { push }
}

export default useRouter