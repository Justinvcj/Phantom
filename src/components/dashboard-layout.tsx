'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard,
  Users,
  Highlighter,
  CheckSquare,
  Calendar,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarSyncButton } from '@/components/calendar-sync-button'
import { NewMeetingModal } from '@/components/new-meeting-modal'
import { ReactNode, useState, useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/',           label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/meetings',   label: 'Meetings',   icon: Users },
  { href: '/highlights', label: 'Highlights', icon: Highlighter },
  { href: '/tasks',      label: 'Tasks',      icon: CheckSquare },
  { href: '/calendar',   label: 'Calendar',   icon: Calendar },
]

const PAGE_TITLES: Record<string, string> = {
  '/':                  'Dashboard',
  '/meetings':          'All Meetings',
  '/highlights':        'Highlights',
  '/tasks':             'Tasks',
  '/calendar':          'Calendar',
  '/settings':          'Settings',
  '/profile':           'Profile',
  '/recording/preview': 'Recording Preview',
}

export function DashboardLayout({ 
  children, 
  activePath,
  showBack = false,
  backLabel,
  backHref,
}: { 
  children: ReactNode
  activePath?: string
  showBack?: boolean
  backLabel?: string
  backHref?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  const active = activePath || pathname

  useEffect(() => {
    const stored = localStorage.getItem('fathom_sidebar_collapsed')
    if (stored === 'true') setCollapsed(true)
    setMounted(true)
  }, [])

  const toggleSidebar = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('fathom_sidebar_collapsed', String(next))
  }

  const pageTitle = PAGE_TITLES[active] || PAGE_TITLES[pathname] || 'Fathom'

  // Don't render until we know the collapse state (prevent flash)
  if (!mounted) return null

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside
        className={`relative flex flex-col bg-slate-100 border-r border-slate-200 transition-[width] duration-200 ease-in-out ${
          collapsed ? 'w-[64px]' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-slate-200 px-4 shrink-0 overflow-hidden`}>
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-600 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            </div>
            {!collapsed && (
              <span className="text-xl font-black text-indigo-700 tracking-tighter">Fathom</span>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = active === href
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors duration-100 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Settings at bottom */}
        <div className="py-4 px-2 border-t border-slate-200">
          <Link
            href="/settings"
            title={collapsed ? 'Settings' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors duration-100 ${
              active === '/settings'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-[4.25rem] z-10 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back button */}
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => backHref ? router.push(backHref) : router.back()}
                className="shrink-0 text-slate-500 hover:text-slate-900"
                title={backLabel || 'Go back'}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-base font-semibold text-slate-700 truncate">{pageTitle}</h1>
          </div>

          <form action="/search" className="max-w-md w-full flex items-center relative hidden sm:flex">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <Input 
              name="q"
              className="w-full pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 h-9" 
              placeholder="Search meetings..." 
            />
          </form>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
              <Bell className="w-5 h-5" />
            </Button>
            <CalendarSyncButton />
            <Link href="/profile" className="cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm hover:ring-2 hover:ring-indigo-300 transition-all">
                SJ
              </div>
            </Link>
            <NewMeetingModal />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
