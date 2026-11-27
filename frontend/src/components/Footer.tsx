import { Link } from 'react-router-dom'
import Container from './Container'

const COLS = [
  { title: 'Shop', links: [['Store', '/store'], ['Deals', '/store?deals=1&sort=discount'], ['New releases', '/store?sort=newest']] },
  { title: 'Account', links: [['Log in', '/login'], ['Register', '/register'], ['Orders', '/orders']] },
]

export default function Footer() {
  return (
    <footer className="mt-16 bg-night">
      <Container className="py-10">
        <div className="flex flex-wrap gap-16">
          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="mb-3 text-sm font-bold">{c.title}</h4>
              <ul className="space-y-2 text-sm">
                {c.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted">Demo marketplace built for an internship assignment. No real payments.</p>
      </Container>
    </footer>
  )
}