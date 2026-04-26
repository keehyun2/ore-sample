import { useState, useEffect } from 'react'
import { Tabs, Tab } from '../Tabs'
import FileSelector from '../InputEditor/FileSelector'
import FileEditor from '../InputEditor/FileEditor'
import FormEditor from '../InputEditor/forms/FormEditor'
import NPVDisplay from '../../components/Output/NPVDisplay'
import CashflowsTable from '../../components/Output/CashflowsTable'
import CurvesChart from '../../components/Output/CurvesChart'
import LogViewer from '../../components/Output/LogViewer'
import Button from '../ui/Button'
import EditorActions from '../InputEditor/EditorActions'
import { api } from '../../services/api'
import { THEME_OPTIONS } from '../InputEditor/CodeEditor'
import { FORM_EDITABLE_FILES, BUTTON_LABELS } from '../../constants/ui'
import { useTheme } from '../../contexts/ThemeContext'

// OIS Consistency example files (these are the key files to show first in the list)
const OIS_CONSISTENCY_FILES = [
  'ore.xml',
  'portfolio_consistency_ois.xml',
  'market_20160205.txt',
  'fixings_20160205.txt',
]

// OIS Consistency example description
const OIS_CONSISTENCY_DESCRIPTION = (
  <div className="rounded-lg bg-blue-50 p-4 text-sm">
    <h3 className="mb-2 font-semibold text-blue-900">OIS Consistency Check</h3>
    <p className="mb-2 text-blue-800">
      This example validates the accuracy of OIS (Overnight Index Swap) curve construction by
      re-pricing OIS swaps and verifying they match market inputs.
    </p>
    <p className="text-blue-700">
      Tests multiple currencies (CHF, EUR, USD, GBP) with collateral_inccy (collateral currency)
      discounting setup.
    </p>
  </div>
)

function OISConsistencyApp() {
  const { prismTheme, setPrismTheme } = useTheme()
  const [filteredFiles, setFilteredFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('ore.xml')
  const [activeTab, setActiveTab] = useState('Input Files')
  const [results, setResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [editorKey, setEditorKey] = useState(0)
  const [resetting, setResetting] = useState(false)
  const [showXMLEditor, setShowXMLEditor] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [hasFileChanges, setHasFileChanges] = useState(false)
  const [fileSaving, setFileSaving] = useState(false)
  const [saveTrigger, setSaveTrigger] = useState(0)
  const [resetTrigger, setResetTrigger] = useState(0)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const fileList = await api.getInputFiles()
      // Filter to show OIS Consistency related files first, then others
      const oisFiles = fileList.filter((f) =>
        OIS_CONSISTENCY_FILES.some((oisFile) => f.includes(oisFile))
      )
      const otherFiles = fileList.filter(
        (f) => !OIS_CONSISTENCY_FILES.some((oisFile) => f.includes(oisFile))
      )
      setFilteredFiles([...oisFiles, ...otherFiles])
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
    setShowXMLEditor(false)
    setHasFileChanges(false)
  }

  const handleFileSave = () => {
    setFileSaving(true)
    setSaveTrigger((prev) => prev + 1)
  }

  const handleFileReset = () => {
    setResetTrigger((prev) => prev + 1)
  }

  const useFormEditor = FORM_EDITABLE_FILES.includes(selectedFile) && !showXMLEditor

  return (
    <Tabs activeTab={activeTab} onChange={setActiveTab}>
      <Tab label="Input Files">
        <div className="flex flex-col">
          {OIS_CONSISTENCY_DESCRIPTION}
          <div className="mx-auto flex h-[calc(100vh-104px-120px)] w-full max-w-full">
            <FileSelector
              files={filteredFiles}
              selected={selectedFile}
              onSelect={handleFileSelect}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{selectedFile}</span>
                  {FORM_EDITABLE_FILES.includes(selectedFile) && (
                    <Button variant="secondary" onClick={() => setShowXMLEditor(!showXMLEditor)}>
                      {showXMLEditor ? 'View Form Editor' : 'View XML Editor'}
                    </Button>
                  )}
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
                  <EditorActions
                    hasChanges={hasFileChanges}
                    saving={fileSaving}
                    onSave={handleFileSave}
                    onReset={handleFileReset}
                  />
                  <Button variant="warning" onClick={handleResetAll} disabled={resetting}>
                    {resetting ? BUTTON_LABELS.resetting : BUTTON_LABELS.resetAll}
                  </Button>
                  <Button variant="success" onClick={handleRun} disabled={running}>
                    {running ? BUTTON_LABELS.running : BUTTON_LABELS.runValuation}
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {useFormEditor ? (
                  <FormEditor
                    key={`${selectedFile}-${editorKey}`}
                    filename={selectedFile}
                    onSave={handleSave}
                    showHeader={false}
                    onHasChangesChange={setHasFileChanges}
                    saveTrigger={saveTrigger}
                    resetTrigger={resetTrigger}
                    onSaveComplete={() => setFileSaving(false)}
                  />
                ) : (
                  <FileEditor
                    key={`${selectedFile}-${editorKey}`}
                    filename={selectedFile}
                    onSave={handleSave}
                    showHeader={false}
                    prismTheme={prismTheme}
                    onHasFileChangesChange={setHasFileChanges}
                    saveTrigger={saveTrigger}
                    resetTrigger={resetTrigger}
                    onSaveComplete={() => setFileSaving(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
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

              {results.success && !results.results && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                  <h3 className="m-0 mb-4 text-green-800">Execution Completed Successfully</h3>
                  <p className="text-green-700">
                    This example does not produce NPV output. Check the log below for details.
                  </p>
                  <div className="mt-4">
                    <Button variant="secondary" onClick={() => setShowLog(!showLog)}>
                      {showLog ? 'Hide Log' : 'Show Log'}
                    </Button>
                  </div>
                  {showLog && <LogViewer logs={results.logs} />}
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
  )
}

export default OISConsistencyApp
