import Container from '../components/Container'

export default function Placeholder({ title }: { title: string }) {
  return (
    <Container>
      <h1 className="py-10 text-3xl font-bold">{title}</h1>
    </Container>
  )
}