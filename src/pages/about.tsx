import useRouter from "../hooks/useRouter"

function About() {
  const { push } = useRouter()
  const handleClick = () => {
    push('/')
  }

  return (
    <div>
      About
      <button onClick={handleClick}>go main</button>
    </div>
  )
}

export default About
