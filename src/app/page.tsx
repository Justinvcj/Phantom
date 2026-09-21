import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Video, Plus, CalendarDays, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function Dashboard() {
  const supabase = createClient()
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-indigo-600 text-white font-bold">
            F
          </div>
          <span className="text-xl font-bold tracking-tight">Fathom Clone</span>
        </div>
        <div className="flex items-center gap-4">
          <form className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              type="search" 
              placeholder="Search meetings..." 
              className="pl-9 w-64 bg-slate-100 border-transparent focus-visible:bg-white"
            />
          </form>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Demo Meeting
          </Button>
          <div className="w-8 h-8 rounded-full bg-slate-300"></div>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Meeting Library</h1>
          <div className="text-sm text-slate-500">{meetings?.length || 0} meetings</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings?.map((meeting) => (
            <Link href={`/meetings/${meeting.id}`} key={meeting.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 font-normal">
                      {meeting.title.includes('Product') ? 'Product' : 'Sync'}
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">Just now</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {meeting.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> {new Date(meeting.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {Math.floor(meeting.duration_seconds / 60)}m
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {meeting.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center text-xs text-slate-500">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-300" />
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-400" />
                  </div>
                  <span className="flex items-center gap-1 text-indigo-600 font-medium group-hover:underline">
                    View <Video className="h-3 w-3" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
          {(!meetings || meetings.length === 0) && (
            <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
              No meetings found. Click &quot;New Demo Meeting&quot; to create one.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props} />
  )
}
