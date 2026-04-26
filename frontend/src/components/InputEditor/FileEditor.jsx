import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { api } from '../../services/api'
import CodeEditor from './CodeEditor'
import Message from '../ui/Message'
import EditorActions from './EditorActions'

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
      <Message message={message} />
      {!showHeader && (
        <EditorActions
          hasChanges={hasChanges}
          saving={saving}
          onSave={handleSave}
          onReset={handleReset}
        />
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
