'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [autoTranscribe, setAutoTranscribe] = useState(true)
  const [theme, setTheme] = useState('system')
  const [defaultTemplate, setDefaultTemplate] = useState('general')

  useEffect(() => {
    // Load from localStorage
    const savedAuto = localStorage.getItem('fathom_auto_transcribe')
    if (savedAuto !== null) setAutoTranscribe(savedAuto === 'true')
    
    const savedTheme = localStorage.getItem('fathom_theme')
    if (savedTheme) setTheme(savedTheme)
    
    const savedTemplate = localStorage.getItem('fathom_default_template')
    if (savedTemplate) setDefaultTemplate(savedTemplate)
    
    setMounted(true)
  }, [])

  const handleAutoTranscribeChange = (checked: boolean) => {
    setAutoTranscribe(checked)
    localStorage.setItem('fathom_auto_transcribe', String(checked))
  }

  const handleThemeChange = (val: string) => {
    setTheme(val)
    localStorage.setItem('fathom_theme', val)
  }

  const handleTemplateChange = (val: string) => {
    setDefaultTemplate(val)
    localStorage.setItem('fathom_default_template', val)
  }

  if (!mounted) return null // Prevent hydration mismatch

  return (
    <DashboardLayout activePath="/settings" showBack backHref="/" backLabel="Back to Dashboard">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500 mb-8">Manage your workspace preferences and recording settings.</p>
          
          <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 space-y-8">
            
            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold text-slate-900">Recording & Transcription</h3>
              <div className="flex items-center justify-between py-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <label htmlFor="auto-transcribe" className="text-base font-medium text-slate-800">Auto-transcribe new meetings</label>
                  <p className="text-sm text-slate-500">Automatically generate AI transcripts when a recording finishes.</p>
                </div>
                <input 
                  type="checkbox"
                  id="auto-transcribe" 
                  checked={autoTranscribe}
                  onChange={(e) => handleAutoTranscribeChange(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <h3 className="font-semibold text-slate-900">AI Preferences</h3>
              <div className="flex flex-col space-y-2 max-w-md">
                <label htmlFor="default-template" className="text-slate-700">Default Summary Template</label>
                <select 
                  id="default-template" 
                  value={defaultTemplate} 
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="general">General Meeting</option>
                  <option value="sales">Sales Discovery</option>
                  <option value="product">Product Sync</option>
                </select>
                <p className="text-sm text-slate-500">This template will be used for auto-generated summaries.</p>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <h3 className="font-semibold text-slate-900">Appearance</h3>
              <div className="flex flex-col space-y-2 max-w-md">
                <label htmlFor="theme" className="text-slate-700">Theme</label>
                <select 
                  id="theme" 
                  value={theme} 
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="system">System Preference</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
