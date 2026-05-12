'use client'

import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

interface MeetingUploaderProps {
  onFile: (content: string, filename: string) => void
  className?: string
}

const ACCEPTED = '.txt,.md,.pdf,.docx,.json'

export default function MeetingUploader({ onFile, className }: MeetingUploaderProps) {
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
        // Send to server for parsing
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/knowledge/parse-file', { method: 'POST', body: form })
        const { text } = await res.json()
        onFile(text, file.name)
      } else {
        const text = await file.text()
        onFile(text, file.name)
      }
    },
    [onFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors',
        dragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-700 hover:border-gray-600',
        className
      )}
    >
      <div className="text-4xl mb-4">📄</div>
      <p className="text-sm font-medium text-white mb-1">Drop a file or click to browse</p>
      <p className="text-xs text-gray-400 mb-4">Accepts .txt, .md, .pdf, .docx, .json (Granola)</p>
      <label className="cursor-pointer rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors">
        Browse files
        <input
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </label>
    </div>
  )
}
