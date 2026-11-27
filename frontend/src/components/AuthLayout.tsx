import { Outlet } from 'react-router-dom'
import Logo from './Logo'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-night text-white">
      <div className="px-6 py-6">
        <Logo />
      </div>
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center gap-10 px-6 py-10 lg:flex-row lg:justify-between">
        <h1 className="text-5xl font-extrabold leading-tight lg:text-7xl">
          Hi!
          <br />
          It’s nice to see you!
        </h1>
        <div className="w-full max-w-[380px] bg-primary p-10">
          <Outlet />
        </div>
      </main>
      <footer className="px-6 py-6 text-center text-xs font-semibold">
        Demo marketplace · No real payments
      </footer>
    </div>
  )
}