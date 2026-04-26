import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { api } from '../../services/api'
import CodeEditor from './CodeEditor'
import Message from '../ui/Message'

function FileEditor({
  filename,
  onSave,
  showHeader = true,
  prismTheme,
  onHasChangesChange,
  saveTrigger = 0,
  resetTrigger = 0,
  onSaveComplete,
}) {
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

  useEffect(() => {
    const hasChanges = content !== originalContent
    if (onHasChangesChange) {
      onHasChangesChange(hasChanges)
    }
  }, [content, originalContent, onHasChangesChange])

  useEffect(() => {
    if (saveTrigger > 0) {
      handleSave()
    }
  }, [saveTrigger])

  useEffect(() => {
    if (resetTrigger > 0) {
      setContent(originalContent)
      setMessage(null)
    }
  }, [resetTrigger, originalContent])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateInputFile(filename, content)
      setOriginalContent(content)
      setMessage({ type: 'success', text: 'File saved successfully' })
      setTimeout(() => setMessage(null), 2000)
      if (onSave) onSave()
      if (onSaveComplete) onSaveComplete()
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to save file: ${error.message}` })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading file...</div>
  }

  return (
    <div className="flex h-full flex-col">
      <Message message={message} />
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
  onHasChangesChange: PropTypes.func,
  saveTrigger: PropTypes.number,
  resetTrigger: PropTypes.number,
  onSaveComplete: PropTypes.func,
}

export default FileEditor
