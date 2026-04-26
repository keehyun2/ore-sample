import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { api } from '../../services/api'
import CodeEditor from './CodeEditor'

function FileEditor({ filename, onSave, showHeader = true, prismTheme }) {
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadFile()
  }, [filename])

  const loadFile = async () => {
    setLoading(true)
    try {
      const data = await api.getInputFile(filename)
      setContent(data.content)
      setOriginalContent(data.content)
      setMessage(null)
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to load file: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateInputFile(filename, content)
      setOriginalContent(content)
      setMessage({ type: 'success', text: 'File saved successfully' })
      setTimeout(() => setMessage(null), 2000)
      if (onSave) onSave()
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to save file: ${error.message}` })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setContent(originalContent)
    setMessage(null)
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading file...</div>
  }

  const hasChanges = content !== originalContent

  return (
    <div className="flex h-full flex-col">
      {message && (
        <div
          className={`mb-3 rounded p-3 text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
      {!showHeader && (
        <div className="mb-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : hasChanges ? 'Save' : 'Saved'}
          </button>
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="rounded border bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      )}
      <div className={showHeader ? '' : 'min-h-0 flex-1'}>
        <CodeEditor
          value={content}
          onChange={setContent}
          disabled={loading}
          currentTheme={prismTheme}
        />
      </div>
    </div>
  )
}

FileEditor.propTypes = {
  filename: PropTypes.string.isRequired,
  onSave: PropTypes.func,
  showHeader: PropTypes.bool,
  prismTheme: PropTypes.string,
}

export default FileEditor
