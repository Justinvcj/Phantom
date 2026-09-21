import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Video, 
  Search, 
  Plus,
  LayoutDashboard,
  Users,
  Highlighter,
  CheckSquare,
  Calendar,
  Settings,
  Bell,
  PlaySquare,
  FileText,
  Share2
} from 'lucide-react'

export default async function Dashboard() {
  const supabase = createClient()
  
  // Fetch meetings
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-100 border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Fathom</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 bg-slate-200/60 text-indigo-700 rounded-md font-medium text-sm">
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
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-200/40 rounded-md font-medium text-sm">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="max-w-xl w-full flex items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <Input 
              className="w-full pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500" 
              placeholder="Search meetings, transcripts, highlights..." 
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-500">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              SJ
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              New Meeting
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Recent Meetings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings?.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <Link href={`/meetings/${meeting.id}`}>
                    <div className="aspect-video bg-slate-900 relative group cursor-pointer">
                      <video src={meeting.recording_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <PlaySquare className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
                        {Math.floor(meeting.duration_seconds / 60)}:{(meeting.duration_seconds % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={`/meetings/${meeting.id}`} className="hover:text-indigo-600 transition-colors">
                      <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{meeting.title}</h3>
                    </Link>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {Math.floor(meeting.duration_seconds / 60)} min
                    </p>
                    
                    <div className="flex items-center gap-1 mt-4">
                      {/* Mock participant avatars */}
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold border border-white z-20">SJ</div>
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold border border-white -ml-2 z-10">RJ</div>
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-bold border border-white -ml-2 z-0">RL</div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
                    <Link href={`/meetings/${meeting.id}`} className="flex flex-col items-center justify-center py-3 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <Video className="w-4 h-4 mb-1" /> View Video
                    </Link>
                    <Link href={`/meetings/${meeting.id}?tab=transcript`} className="flex flex-col items-center justify-center py-3 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <FileText className="w-4 h-4 mb-1" /> Transcript
                    </Link>
                    <button className="flex flex-col items-center justify-center py-3 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <Share2 className="w-4 h-4 mb-1" /> Share
                    </button>
                  </div>
                </div>
              ))}
              
              {(!meetings || meetings.length === 0) && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                  <Video className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-lg font-medium text-slate-900">No meetings found</p>
                  <p className="mb-6">Click &quot;New Meeting&quot; to create one.</p>
                  <Button>New Meeting</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
