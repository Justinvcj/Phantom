'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState('Steve Jobs')
  const [email, setEmail] = useState('steve@apple.com')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load from localStorage mock
    const savedName = localStorage.getItem('fathom_user_name')
    if (savedName) setName(savedName)
    
    const savedEmail = localStorage.getItem('fathom_user_email')
    if (savedEmail) setEmail(savedEmail)
    
    setMounted(true)
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('fathom_user_name', name)
    localStorage.setItem('fathom_user_email', email)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!mounted) return null

  return (
    <DashboardLayout activePath="/profile" showBack backHref="/" backLabel="Back to Dashboard">
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">User Profile</h1>
          <p className="text-slate-500 mb-8">Manage your personal information and account security.</p>
          
          <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl border-4 border-white shadow-sm">
                {name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{name}</h2>
                <p className="text-slate-500">{email}</p>
              </div>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Address</label>
                    <Input 
                      id="email" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex items-center gap-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  Save Changes
                </Button>
                {saved && <span className="text-sm font-medium text-emerald-600">Profile updated!</span>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
