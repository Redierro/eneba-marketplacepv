import { Heart, Menu, ShoppingCart, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Container from './Container'
import Logo from './Logo'
import SearchBox from './SearchBox'
import { useCart } from '../context/CartContext'
import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { label: 'Categories', to: '/store', menu: true },
  { label: 'Cheap Games', to: '/store?sort=price_asc' },
  { label: 'Deals', to: '/store?deals=1&sort=discount' },
  { label: 'New releases', to: '/store?sort=newest' },
  { label: 'Best sellers', to: '/store?sort=popular' },
]

export default function Header() {
  const { user, loading, logout } = useAuth()
  const { count } = useCart()
  const loc = useLocation()
  const from = { from: loc.pathname + loc.search }

  return (
    <header>
      <div className="bg-primary">
        <Container className="flex flex-wrap items-center gap-x-8 gap-y-3 py-4 md:h-24 md:flex-nowrap md:py-0">
          <Logo />
          <div className="order-last w-full md:order-none md:flex-1">
            <SearchBox />
          </div>
          <div className="ml-auto flex items-center gap-6 text-sm font-semibold md:ml-0">
            <span className="hidden whitespace-nowrap lg:block">English EU | EUR</span>
            <Link to="/store?deals=1&sort=discount" aria-label="Deals">
              <Heart size={26} />
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative">
			  <ShoppingCart size={26} />
			  {count > 0 && (
				<span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-crimson px-1 text-[10px] font-bold">
				  {count}
				</span>
			  )}
			</Link>
            {!loading && (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <User size={26} />
                {user ? (
                  <>
                    <Link to="/orders" className="hover:underline">
                      {user.name}
                    </Link>
                    <span>|</span>
                    <button onClick={logout} className="hover:underline">
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" state={from} className="hover:underline">
                      Log in
                    </Link>
                    <span>|</span>
                    <Link to="/register" state={from} className="hover:underline">
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </Container>
      </div>

      <nav className="bg-primary-dark">
        <Container className="flex h-[50px] items-center overflow-x-auto">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              className="flex items-center gap-2 whitespace-nowrap px-[10px] text-base font-semibold text-muted transition-colors duration-150 hover:text-white"
            >
              {n.menu && <Menu size={22} />}
              {n.label}
            </Link>
          ))}
        </Container>
      </nav>
    </header>
  )
}