import { useState, useEffect } from 'react'
import { Tabs, Tab } from './components/Tabs'
import FileSelector from './components/InputEditor/FileSelector'
import FileEditor from './components/InputEditor/FileEditor'
import FormEditor from './components/InputEditor/forms/FormEditor'
import FREDRates from './components/InputEditor/FREDRates'
import NPVDisplay from './components/Output/NPVDisplay'
import CashflowsTable from './components/Output/CashflowsTable'
import CurvesChart from './components/Output/CurvesChart'
import LogViewer from './components/Output/LogViewer'
import Button from './components/ui/Button'
import { api } from './services/api'
import { THEME_OPTIONS } from './components/InputEditor/CodeEditor'
import { FORM_EDITABLE_FILES, BUTTON_LABELS } from './constants/ui'

function App() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('irswap.xml')
  const [activeTab, setActiveTab] = useState('Input Files')
  const [results, setResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [editorKey, setEditorKey] = useState(0)
  const [resetting, setResetting] = useState(false)
  const [showXMLEditor, setShowXMLEditor] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [prismTheme, setPrismTheme] = useState('tomorrow')

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const fileList = await api.getInputFiles()
      setFiles(fileList)
    } catch (error) {
      console.error('Failed to load files:', error)
    }
  }

  const handleRun = async () => {
    setRunning(true)
    setShowLog(false)
    setActiveTab('Output Results')
    try {
      const result = await api.runORE()
      setResults(result)
    } catch (error) {
      setResults({
        success: false,
        error: error.message,
        logs: 'Failed to execute ORE',
      })
    } finally {
      setRunning(false)
    }
  }

  const handleSave = () => {
    setEditorKey((prev) => prev + 1)
  }

  const handleResetAll = async () => {
    if (!confirm('Reset all input files to original? This will discard all your changes.')) {
      return
    }
    setResetting(true)
    try {
      await api.resetInputFiles()
      setEditorKey((prev) => prev + 1)
      setResults(null)
    } catch (error) {
      alert('Failed to reset files: ' + error.message)
    } finally {
      setResetting(false)
    }
  }

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setShowXMLEditor(false) // Reset to form view when switching files
  }

  const useFormEditor = FORM_EDITABLE_FILES.includes(selectedFile) && !showXMLEditor

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-gradient-to-br from-[#1e40af] to-[#3b82f6] px-4 py-3 text-center text-white">
        <h1 className="m-0 text-xl font-semibold">ORE IR Swap Valuation</h1>
        <p className="mt-1 text-xs opacity-90">Interest Rate Swap Pricing Engine</p>
      </header>

      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <Tab label="Input Files">
          <div className="mx-auto flex h-[calc(100vh-52px)] w-full max-w-full">
            <FileSelector files={files} selected={selectedFile} onSelect={handleFileSelect} />
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Header with Reset, XML Editor toggle, Theme, and Run buttons */}
              <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{selectedFile}</span>
                  {!useFormEditor && (
                    <select
                      value={prismTheme}
                      onChange={(e) => setPrismTheme(e.target.value)}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs"
                    >
                      {THEME_OPTIONS.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                          {theme.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="warning" onClick={handleResetAll} disabled={resetting}>
                    {resetting ? BUTTON_LABELS.resetting : BUTTON_LABELS.resetAll}
                  </Button>
                  {FORM_EDITABLE_FILES.includes(selectedFile) && (
                    <Button variant="secondary" onClick={() => setShowXMLEditor(!showXMLEditor)}>
                      {showXMLEditor ? 'View Form Editor' : 'View XML Editor'}
                    </Button>
                  )}
                  <Button variant="success" onClick={handleRun} disabled={running}>
                    {running ? BUTTON_LABELS.running : BUTTON_LABELS.runValuation}
                  </Button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto p-3">
                {useFormEditor ? (
                  <FormEditor
                    key={`${selectedFile}-${editorKey}`}
                    filename={selectedFile}
                    onSave={handleSave}
                    showHeader={false}
                  />
                ) : (
                  <FileEditor
                    key={`${selectedFile}-${editorKey}`}
                    filename={selectedFile}
                    onSave={handleSave}
                    showHeader={false}
                    prismTheme={prismTheme}
                  />
                )}
              </div>
            </div>
          </div>
        </Tab>

        <Tab label="FRED Rates">
          <FREDRates />
        </Tab>

        <Tab label="Output Results">
          <div className="mx-auto max-w-[1200px]">
            {running && (
              <div className="py-12 text-center">
                <div className="border-3 mx-auto mb-4 size-10 animate-spin rounded-full border-gray-300 border-t-blue-600"></div>
                <p>Running ORE valuation...</p>
              </div>
            )}

            {!running && !results && (
              <div className="py-12 text-center text-gray-600">
                <p>No results available.</p>
                <p>Run the valuation from the Input Files tab first.</p>
              </div>
            )}

            {!running && results && (
              <>
                {!results.success && (
                  <div className="mb-8 rounded-xl border border-red-200 bg-red-100 p-6">
                    <h3 className="m-0 mb-4 text-red-800">Execution Failed</h3>
                    <LogViewer logs={results.logs} error={results.error} />
                  </div>
                )}

                {results.success && results.results && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="m-0 text-xl font-semibold">Valuation Results</h2>
                      <Button variant="secondary" onClick={() => setShowLog(!showLog)}>
                        {showLog ? 'Hide Log' : 'Show Log'}
                      </Button>
                    </div>
                    <NPVDisplay data={results.results.npv} />
                    <CashflowsTable flows={results.results.flows} />
                    <CurvesChart curves={results.results.curves} />
                    {showLog && <LogViewer logs={results.logs} />}
                  </div>
                )}
              </>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}

export default App
