import Link from 'next/link'
import { 
  LayoutDashboard,
  Users,
  Highlighter,
  CheckSquare,
  Calendar,
  Settings,
  Bell,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarSyncButton } from '@/components/calendar-sync-button'
import { NewMeetingModal } from '@/components/new-meeting-modal'
import { ReactNode } from 'react'

export function DashboardLayout({ children, activePath = '/' }: { children: ReactNode, activePath?: string }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-100 border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="text-2xl font-black text-indigo-700 tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            </div>
            Fathom
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${activePath === '/' ? 'bg-slate-200/60 text-indigo-700' : 'text-slate-600 hover:bg-slate-200/40'}`}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-200/40 rounded-md font-medium text-sm">
            <Users className="w-4 h-4" /> Meetings
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-200/40 rounded-md font-medium text-sm">
            <Highlighter className="w-4 h-4" /> Highlights
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-200/40 rounded-md font-medium text-sm">
            <CheckSquare className="w-4 h-4" /> Tasks
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-200/40 rounded-md font-medium text-sm">
            <Calendar className="w-4 h-4" /> Calendar
          </Link>
        </nav>

        <div className="p-4">
          <Link href="/settings" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${activePath === '/settings' ? 'bg-slate-200/60 text-indigo-700' : 'text-slate-600 hover:bg-slate-200/40'}`}>
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <form action="/search" className="max-w-xl w-full flex items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <Input 
              name="q"
              className="w-full pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500" 
              placeholder="Search meetings, transcripts, highlights..." 
            />
          </form>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-500">
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

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
