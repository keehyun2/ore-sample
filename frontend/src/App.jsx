import { useState, useEffect } from 'react';
import { Tabs, Tab } from './components/Tabs';
import FileSelector from './components/InputEditor/FileSelector';
import FileEditor from './components/InputEditor/FileEditor';
import FormEditor from './components/InputEditor/forms/FormEditor';
import FREDRates from './components/InputEditor/FREDRates';
import NPVDisplay from './components/Output/NPVDisplay';
import CashflowsTable from './components/Output/CashflowsTable';
import CurvesChart from './components/Output/CurvesChart';
import LogViewer from './components/Output/LogViewer';
import { api } from './services/api';
import { THEME_OPTIONS } from './components/InputEditor/CodeEditor';

// Files that support form-based editing
const FORM_EDITABLE_FILES = ['ore.xml', 'irswap.xml', 'conventions.xml'];

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('irswap.xml');
  const [activeTab, setActiveTab] = useState('Input Files');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [showXMLEditor, setShowXMLEditor] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [prismTheme, setPrismTheme] = useState('tomorrow');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const fileList = await api.getInputFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setShowLog(false);
    setActiveTab('Output Results');
    try {
      const result = await api.runORE();
      setResults(result);
    } catch (error) {
      setResults({
        success: false,
        error: error.message,
        logs: 'Failed to execute ORE',
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSave = () => {
    setEditorKey((prev) => prev + 1);
  };

  const handleResetAll = async () => {
    if (!confirm('Reset all input files to original? This will discard all your changes.')) {
      return;
    }
    setResetting(true);
    try {
      await api.resetInputFiles();
      setEditorKey((prev) => prev + 1);
      setResults(null);
    } catch (error) {
      alert('Failed to reset files: ' + error.message);
    } finally {
      setResetting(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setShowXMLEditor(false); // Reset to form view when switching files
  };

  const useFormEditor = FORM_EDITABLE_FILES.includes(selectedFile) && !showXMLEditor;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-[#1e40af] to-[#3b82f6] text-white py-3 px-4 text-center">
        <h1 className="m-0 text-xl font-semibold">ORE IR Swap Valuation</h1>
        <p className="mt-1 opacity-90 text-xs">Interest Rate Swap Pricing Engine</p>
      </header>

      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <Tab label="Input Files">
          <div className="flex max-w-full mx-auto w-full h-[calc(100vh-52px)]">
            <FileSelector
              files={files}
              selected={selectedFile}
              onSelect={handleFileSelect}
            />
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header with Reset, XML Editor toggle, Theme, and Run buttons */}
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{selectedFile}</span>
                  {!useFormEditor && (
                    <select
                      value={prismTheme}
                      onChange={(e) => setPrismTheme(e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                    >
                      {THEME_OPTIONS.map(theme => (
                        <option key={theme.id} value={theme.id}>{theme.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetAll}
                    disabled={resetting}
                    className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
                  >
                    {resetting ? 'Resetting...' : 'Reset All'}
                  </button>
                  {FORM_EDITABLE_FILES.includes(selectedFile) && (
                    <button
                      className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      onClick={() => setShowXMLEditor(!showXMLEditor)}
                    >
                      {showXMLEditor ? 'View Form Editor' : 'View XML Editor'}
                    </button>
                  )}
                  <button
                    onClick={handleRun}
                    disabled={running}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {running ? 'Running...' : 'Run Valuation'}
                  </button>
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
          <div className="max-w-[1200px] mx-auto">
            {running && (
              <div className="text-center py-12">
                <div className="w-10 h-10 mx-auto mb-4 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <p>Running ORE valuation...</p>
              </div>
            )}

            {!running && !results && (
              <div className="text-center py-12 text-gray-600">
                <p>No results available.</p>
                <p>Run the valuation from the Input Files tab first.</p>
              </div>
            )}

            {!running && results && (
              <>
                {!results.success && (
                  <div className="bg-red-100 border border-red-200 rounded-xl p-6 mb-8">
                    <h3 className="m-0 mb-4 text-red-800">Execution Failed</h3>
                    <LogViewer logs={results.logs} error={results.error} />
                  </div>
                )}

                {results.success && results.results && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="m-0 text-xl font-semibold">Valuation Results</h2>
                      <button
                        onClick={() => setShowLog(!showLog)}
                        className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                      >
                        {showLog ? 'Hide Log' : 'Show Log'}
                      </button>
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
  );
}

export default App;
