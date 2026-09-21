export default function Loading() {
  return (
    <div className="w-full h-0.5 bg-slate-100 overflow-hidden">
      <div className="h-full bg-indigo-500 animate-[loading_1.2s_ease-in-out_infinite]" style={{ width: '40%' }} />
    </div>
  )
}
