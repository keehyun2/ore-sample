import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { api } from '../../../services/api'
import OREForm from './OREForm'
import IRSwapForm from './IRSwapForm'
import ConventionsForm from './ConventionsForm'
import Message from '../../ui/Message'
import EditorActions from '../EditorActions'
import {
  parseOREXML,
  generateOREXML,
  parseIRSwapXML,
  generateIRSwapXML,
  parseConventionsXML,
  generateConventionsXML,
} from '../../../utils/xmlParser'

function FormEditor({ filename, onSave, showHeader = true }) {
  const [data, setData] = useState(null)
  const [originalXML, setOriginalXML] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadFile()
  }, [filename])

  const loadFile = async () => {
    setLoading(true)
    try {
      const fileData = await api.getInputFile(filename)
      setOriginalXML(fileData.content)

      // Parse XML based on filename
      let parsedData
      switch (filename) {
        case 'ore.xml':
          parsedData = parseOREXML(fileData.content)
          break
        case 'irswap.xml':
          parsedData = parseIRSwapXML(fileData.content)
          break
        case 'conventions.xml':
          parsedData = parseConventionsXML(fileData.content)
          break
        default:
          throw new Error('Unsupported file type for form editing')
      }

      setData(parsedData)
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
      // Generate XML based on filename
      let xmlContent
      switch (filename) {
        case 'ore.xml':
          xmlContent = generateOREXML(data)
          break
        case 'irswap.xml':
          xmlContent = generateIRSwapXML(data)
          break
        case 'conventions.xml':
          xmlContent = generateConventionsXML(data)
          break
        default:
          throw new Error('Unsupported file type for form editing')
      }

      await api.updateInputFile(filename, xmlContent)
      setOriginalXML(xmlContent)
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
    loadFile()
    setMessage(null)
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading file...</div>
  }

  const hasChanges =
    JSON.stringify(data) !==
    JSON.stringify(
      filename === 'ore.xml'
        ? parseOREXML(originalXML)
        : filename === 'irswap.xml'
          ? parseIRSwapXML(originalXML)
          : parseConventionsXML(originalXML)
    )

  const renderForm = () => {
    switch (filename) {
      case 'ore.xml':
        return <OREForm data={data} onChange={setData} />
      case 'irswap.xml':
        return <IRSwapForm data={data} onChange={setData} />
      case 'conventions.xml':
        return <ConventionsForm data={data} onChange={setData} />
      default:
        return <div>Unsupported file type for form editing</div>
    }
  }

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
      <div className={showHeader ? '' : 'min-h-0 flex-1 overflow-auto'}>{renderForm()}</div>
    </div>
  )
}

FormEditor.propTypes = {
  filename: PropTypes.string.isRequired,
  onSave: PropTypes.func,
  showHeader: PropTypes.bool,
}

export default FormEditor
