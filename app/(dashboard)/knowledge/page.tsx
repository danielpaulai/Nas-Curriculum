'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface KbEntry {
  id: string
  category: string
  fact: string
  confidence: string
  status: string
  createdAt: string
}

const CATEGORIES = [
  'All',
  'AI Tools',
  'Audience Insights',
  'Content Strategy',
  'Session Formats',
  'Community',
  'Business Model',
  'Competitors',
  'Other',
]

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KbEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Add form state
  const [newCategory, setNewCategory] = useState('AI Tools')
  const [customCategory, setCustomCategory] = useState('')
  const [newFact, setNewFact] = useState('')
  const [newStatus, setNewStatus] = useState('active')
  const [saving, setSaving] = useState(false)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      else if (activeCategory !== 'All') params.set('category', activeCategory)
      const res = await fetch(`/api/knowledge/entries?${params}`)
      const data = await res.json()
      setEntries(data.entries ?? [])
    } catch {
      toast.error('Failed to load entries')
    } finally {
      setLoading(false)
    }
  }, [search, activeCategory])

  useEffect(() => {
    const t = setTimeout(fetchEntries, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [fetchEntries, search])

  async function addEntry() {
    const cat = newCategory === 'Other' ? customCategory.trim() : newCategory
    if (!cat || !newFact.trim()) { toast.error('Fill in category and content'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/knowledge/entries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ category: cat, fact: newFact, status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Entry added')
      setShowAdd(false)
      setNewFact('')
      setNewCategory('AI Tools')
      setCustomCategory('')
      fetchEntries()
    } catch {
      toast.error('Failed to add entry')
    } finally {
      setSaving(false)
    }
  }

  async function deleteEntry(id: string) {
    try {
      await fetch(`/api/knowledge/entries/${id}`, { method: 'DELETE' })
      setEntries((prev) => prev.filter((e) => e.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  async function toggleStatus(entry: KbEntry) {
    const next = entry.status === 'active' ? 'archived' : 'active'
    try {
      await fetch(`/api/knowledge/entries/${entry.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, status: next } : e))
    } catch {
      toast.error('Failed to update')
    }
  }

  const allCategories = ['All', ...Array.from(new Set(entries.map((e) => e.category))).sort()]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
          <p className="text-sm text-gray-400 mt-1">Facts, insights, and research that inform your content</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-500">
          + Add Entry
        </Button>
      </div>

      {/* Add Entry Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-5">Add Knowledge Entry</h2>
            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block">Category</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {CATEGORIES.filter(c => c !== 'All').map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewCategory(c)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        newCategory === c
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {newCategory === 'Other' && (
                  <Input
                    placeholder="Custom category name"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
              <div>
                <Label className="mb-1.5 block">Content / Fact</Label>
                <Textarea
                  placeholder="e.g. NAS audience responds 40% better to titles with specific numbers like '7 tools' vs generic 'several tools'"
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Status</Label>
                <div className="flex gap-2">
                  {['active', 'pending', 'archived'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewStatus(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                        newStatus === s
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
              <Button onClick={addEntry} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-500">
                {saving ? 'Saving…' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="space-y-4 mb-6">
        <Input
          placeholder="Search entries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border-gray-800"
        />
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSearch('') }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat && !search
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-6 text-sm text-gray-500 mb-6">
        <span><span className="text-white font-semibold">{entries.length}</span> entries</span>
        <span><span className="text-emerald-400 font-semibold">{entries.filter(e => e.status === 'active').length}</span> active</span>
        <span><span className="text-yellow-400 font-semibold">{entries.filter(e => e.status === 'pending').length}</span> pending</span>
      </div>

      {/* Entries grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-3">🧠</p>
          <p className="text-lg font-medium text-gray-400">No entries yet</p>
          <p className="text-sm mt-1">Add research, insights, and facts that shape your content strategy</p>
          <Button onClick={() => setShowAdd(true)} className="mt-6 bg-indigo-600 hover:bg-indigo-500">
            Add your first entry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`bg-gray-900 border rounded-xl p-4 flex flex-col gap-3 transition-all hover:border-gray-700 ${
                editingId === entry.id ? 'border-indigo-500' : 'border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {entry.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[entry.status] ?? STATUS_COLORS.pending}`}>
                    {entry.status}
                  </span>
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed flex-1">{entry.fact}</p>

              <div className="flex gap-2 pt-1 border-t border-gray-800">
                <button
                  onClick={() => toggleStatus(entry)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {entry.status === 'active' ? 'Archive' : 'Activate'}
                </button>
                <span className="text-gray-700">·</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(entry.fact)
                    toast.success('Copied!')
                  }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Copy
                </button>
                <span className="text-gray-700">·</span>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-xs text-red-700 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
