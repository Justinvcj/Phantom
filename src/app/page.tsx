import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Video, Plus, Clock, CalendarDays } from "lucide-react"

export default function Dashboard() {
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
          <div className="text-sm text-slate-500">6 meetings</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mock meeting cards for the shell */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 font-normal">
                    {i === 1 ? "Product" : "Internal Sync"}
                  </Badge>
                  <span className="text-xs text-slate-500 font-medium">Just now</span>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {i === 1 ? "Q3 Product Strategy" : `Weekly Sync ${i}`}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> Sep 20, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {i === 1 ? "1h 03m" : "30m"}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {i === 1 
                    ? "Discussed the Q3 roadmap, key OKRs, and the new feature rollout schedule. Action items assigned for engineering." 
                    : "Regular weekly sync to cover current sprint progress and blockers."}
                </p>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between items-center text-xs text-slate-500">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-300" />
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-400" />
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-500" />
                  {i === 1 && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-slate-100 text-[10px]">
                      +5
                    </div>
                  )}
                </div>
                <span className="flex items-center gap-1 text-indigo-600 font-medium group-hover:underline">
                  View <Video className="h-3 w-3" />
                </span>
              </CardFooter>
            </Card>
          ))}
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
